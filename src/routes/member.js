const express = require('express');
const router = express.Router();
const Joi = require('joi');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const Member = require('../models/Member');
const Community = require('../models/Community');
const User = require('../models/User');
const Role = require('../models/Role');

// Validation schemas
const addMemberSchema = Joi.object({
  community: Joi.string().required()
    .messages({
      'string.empty': 'Community ID is required.',
      'any.required': 'Community ID is required.'
    }),
  user: Joi.string().required()
    .messages({
      'string.empty': 'User ID is required.',
      'any.required': 'User ID is required.'
    }),
  role: Joi.string().required()
    .messages({
      'string.empty': 'Role ID is required.',
      'any.required': 'Role ID is required.'
    }),
});

// Add member to community
router.post('/', auth, validate(addMemberSchema), async (req, res) => {
  try {
    const { community: communityId, user: userId, role: roleId } = req.body;

    // Check if community exists
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(400).json({
        status: false,
        errors: [{
          param: 'community',
          message: 'Community not found.',
          code: 'RESOURCE_NOT_FOUND'
        }]
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        status: false,
        errors: [{
          param: 'user',
          message: 'User not found.',
          code: 'RESOURCE_NOT_FOUND'
        }]
      });
    }

    // Check if role exists
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(400).json({
        status: false,
        errors: [{
          param: 'role',
          message: 'Role not found.',
          code: 'RESOURCE_NOT_FOUND'
        }]
      });
    }

    // Check if the authenticated user is an admin of the community
    const adminMember = await Member.findOne({
      community: communityId,
      user: req.user._id,
      role: { $in: await Role.find({ name: 'Community Admin' }).distinct('_id') }
    });

    if (!adminMember && req.user._id !== community.owner) {
      return res.status(400).json({
        status: false,
        errors: [{
          message: 'You are not authorized to perform this action.',
          code: 'NOT_ALLOWED_ACCESS'
        }]
      });
    }

    // Check if member already exists
    const existingMember = await Member.findOne({ community: communityId, user: userId });
    if (existingMember) {
      return res.status(400).json({
        status: false,
        errors: [{
          message: 'User is already added in the community.',
          code: 'RESOURCE_EXISTS'
        }]
      });
    }

    // Create new member
    const member = new Member({
      community: communityId,
      user: userId,
      role: roleId
    });
    await member.save();

    res.status(201).json({
      status: true,
      content: {
        data: {
          id: member._id,
          community: member.community,
          user: userId,
          role: roleId,
          created_at: member.created_at
        }
      }
    });
  } catch (error) {
    // Check for duplicate key error (MongoDB error code 11000)
    if (error.code === 11000) {
      return res.status(400).json({
        status: false,
        errors: [{
          message: 'User is already added in the community.',
          code: 'RESOURCE_EXISTS'
        }]
      });
    }

    res.status(500).json({
      status: false,
      errors: [{
        message: 'Error adding member to community',
        code: 'SERVER_ERROR'
      }]
    });
  }
});

// Remove member from community
router.delete('/:id', auth, async (req, res) => {
  try {
    const memberId = req.params.id;

    // Check if member exists
    const member = await Member.findById(memberId)
      .populate('community')
      .populate('user')
      .populate('role');
    
    if (!member) {
      return res.status(404).json({
        status: false,
        errors: [{
          message: "Member not found.",
          code: "RESOURCE_NOT_FOUND"
        }]
      });
    }

    // Check if the authenticated user is an admin or moderator of the community
    const authUserMember = await Member.findOne({
      community: member.community._id,
      user: req.user._id,
      role: { 
        $in: await Role.find({ 
          name: { $in: ['Community Admin', 'Community Moderator'] } 
        }).distinct('_id') 
      }
    });

    // Allow if user is community owner or has admin/moderator role
    if (!authUserMember && req.user._id !== member.community.owner) {
      return res.status(403).json({
        status: false,
        errors: [{
          message: "You are not authorized to perform this action.",
          code: "NOT_ALLOWED_ACCESS"
        }]
      });
    }

    // Prevent removing community owner
    if (member.user._id === member.community.owner) {
      return res.status(400).json({
        status: false,
        errors: [{
          message: "Cannot remove the community owner.",
          code: "NOT_ALLOWED_ACCESS"
        }]
      });
    }

    // Prevent moderators from removing admins
    const userRole = await Role.findById(authUserMember?.role);
    if (userRole?.name === 'Community Moderator') {
      const memberRole = await Role.findById(member.role);
      if (memberRole.name === 'Community Admin') {
        return res.status(403).json({
          status: false,
          errors: [{
            message: "Moderators cannot remove admins from the community.",
            code: "NOT_ALLOWED_ACCESS"
          }]
        });
      }
    }

    // Remove member
    await Member.findByIdAndDelete(memberId);

    res.status(200).json({
      status: true,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      errors: [{
        message: "Error removing member from community",
        code: "SERVER_ERROR"
      }]
    });
  }
});

module.exports = router; 