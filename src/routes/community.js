const express = require('express');
const router = express.Router();
const Joi = require('joi');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const Community = require('../models/Community');
const Member = require('../models/Member');
const Role = require('../models/Role');

// Validation schemas
const createCommunitySchema = Joi.object({
  name: Joi.string().min(2).required()
    .messages({
      'string.min': 'Name should be at least 2 characters.',
      'string.empty': 'Name is required.',
      'any.required': 'Name is required.'
    }),
});

// Create community
router.post('/', auth, validate(createCommunitySchema), async (req, res) => {
  try {
    const { name } = req.body;

    // Create community
    const community = new Community({
      name,
      owner: req.user._id,
    });
    await community.save();

    // Find admin role
    const adminRole = await Role.findOne({ name: 'Community Admin' });
    if (!adminRole) {
      throw new Error('Admin role not found');
    }

    // Add owner as community admin
    const member = new Member({
      community: community._id,
      user: req.user._id,
      role: adminRole._id,
    });
    await member.save();

    res.status(200).json({
      status: true,
      content: {
        data: {
          id: community._id,
          name: community.name,
          slug: community.slug,
          owner: req.user._id,
          created_at: community.created_at,
          updated_at: community.updated_at
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      errors: [{ message: 'Error creating community' }]
    });
  }
});

// Get all communities
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const communities = await Community.find()
      .populate('owner', 'id name')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Community.countDocuments();

    res.json({
      status: true,
      content: {
        meta: {
          total,
          pages: Math.ceil(total / limit),
          page
        },
        data: communities.map(community => ({
          id: community._id,
          name: community.name,
          slug: community.slug,
          owner: {
            id: community.owner._id,
            name: community.owner.name
          },
          created_at: community.created_at,
          updated_at: community.updated_at
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      errors: [{ message: 'Error fetching communities' }]
    });
  }
});

// Get all communities owned by me
router.get('/me/owner', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const communities = await Community.find({ owner: req.user._id })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Community.countDocuments({ owner: req.user._id });

    res.json({
      status: true,
      content: {
        meta: {
          total,
          pages: Math.ceil(total / limit),
          page
        },
        data: communities.map(community => ({
          id: community._id,
          name: community.name,
          slug: community.slug,
          owner: req.user._id,
          created_at: community.created_at,
          updated_at: community.updated_at
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      errors: [{ message: 'Error fetching owned communities' }]
    });
  }
});

// Get all communities joined by me
router.get('/me/member', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const memberships = await Member.find({ user: req.user._id })
      .populate({
        path: 'community',
        populate: { path: 'owner', select: 'id name' }
      })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Member.countDocuments({ user: req.user._id });

    res.json({
      status: true,
      content: {
        meta: {
          total,
          pages: Math.ceil(total / limit),
          page
        },
        data: memberships.map(membership => ({
          id: membership.community._id,
          name: membership.community.name,
          slug: membership.community.slug,
          owner: {
            id: membership.community.owner._id,
            name: membership.community.owner.name
          },
          created_at: membership.community.created_at,
          updated_at: membership.community.updated_at
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      errors: [{ message: 'Error fetching joined communities' }]
    });
  }
});

router.get('/:id/members', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Check if community exists
    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({
        status: false,
        errors: [{ 
          message: 'Community not found',
          code: 'RESOURCE_NOT_FOUND'
        }]
      });
    }

    // Get members of the community
    const members = await Member.find({ community: id })
      .populate('user', 'id name')
      .populate('role', 'id name')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Member.countDocuments({ community: id });

    res.json({
      status: true,
      content: {
        meta: {
          total,
          pages: Math.ceil(total / limit),
          page
        },
        data: members.map(member => ({
          id: member._id,
          community: member.community,
          user: {
            id: member.user._id,
            name: member.user.name
          },
          role: {
            id: member.role._id,
            name: member.role.name
          },
          created_at: member.created_at
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      errors: [{ 
        message: 'Error fetching community members',
        code: 'SERVER_ERROR'
      }]
    });
  }
});

module.exports = router; 