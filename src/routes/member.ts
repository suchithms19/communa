import express, { Router, Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import prisma from '../config/prisma';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';

const router: Router = express.Router();

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    name: string | null;
    email: string;
  };
}

// Validation schemas
const addMemberSchema = Joi.object({
  community: Joi.number().required()
    .messages({
      'number.base': 'Community ID must be a number.',
      'any.required': 'Community ID is required.'
    }),
  user: Joi.number().required()
    .messages({
      'number.base': 'User ID must be a number.',
      'any.required': 'User ID is required.'
    }),
  role: Joi.number().required()
    .messages({
      'number.base': 'Role ID must be a number.',
      'any.required': 'Role ID is required.'
    }),
});

// Add member to community
router.post('/', auth, validate(addMemberSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Parse IDs as integers
    const communityId = parseInt(req.body.community, 10);
    const userId = parseInt(req.body.user, 10);
    const roleId = parseInt(req.body.role, 10);

    if (!req.user) {
      res.status(401).json({
        status: false,
        errors: [{ message: 'User not authenticated' }]
      });
      return;
    }

    // Check if community exists
    const community = await prisma.community.findUnique({
      where: { id: communityId },
      include: {
        members: {
          where: {
            userId: req.user.id,
            role: 'Community Admin'
          }
        }
      }
    });

    if (!community) {
      res.status(400).json({
        status: false,
        errors: [{
          param: 'community',
          message: 'Community not found.',
          code: 'RESOURCE_NOT_FOUND'
        }]
      });
      return;
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(400).json({
        status: false,
        errors: [{
          param: 'user',
          message: 'User not found.',
          code: 'RESOURCE_NOT_FOUND'
        }]
      });
      return;
    }

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!role) {
      res.status(400).json({
        status: false,
        errors: [{
          param: 'role',
          message: 'Role not found.',
          code: 'RESOURCE_NOT_FOUND'
        }]
      });
      return;
    }

    // Check if the authenticated user is an admin of the community
    if (community.members.length === 0) {
      res.status(403).json({
        status: false,
        errors: [{
          message: 'You are not authorized to perform this action.',
          code: 'NOT_ALLOWED_ACCESS'
        }]
      });
      return;
    }

    // Check if member already exists
    const existingMember = await prisma.member.findFirst({
      where: {
        communityId,
        userId
      }
    });

    if (existingMember) {
      res.status(400).json({
        status: false,
        errors: [{
          message: 'User is already added in the community.',
          code: 'RESOURCE_EXISTS'
        }]
      });
      return;
    }

    // Create new member with role name
    const member = await prisma.member.create({
      data: {
        communityId,
        userId,
        role: role.name // Use role.name instead of roleId
      }
    });

    res.status(200).json({
      status: true,
      content: {
        data: {
          id: member.id.toString(),
          community: member.communityId.toString(),
          user: member.userId.toString(),
          role: role.id.toString(),
          created_at: member.createdAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Remove member from community
router.delete('/:id', auth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const memberId = parseInt(req.params.id, 10);

    if (!req.user) {
      res.status(401).json({
        status: false,
        errors: [{ message: 'User not authenticated' }]
      });
      return;
    }

    // Check if member exists
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        community: {
          include: {
            members: {
              where: {
                userId: req.user.id
              }
            }
          }
        },
        user: true
      }
    });
    
    if (!member) {
      res.status(404).json({
        status: false,
        errors: [{
          message: "Member not found.",
          code: "RESOURCE_NOT_FOUND"
        }]
      });
      return;
    }

    // Get role information for the authenticated user
    const authUserMember = member.community.members[0];
    if (!authUserMember || !['Community Admin', 'Community Moderator'].includes(authUserMember.role)) {
      res.status(403).json({
        status: false,
        errors: [{
          message: "You are not authorized to perform this action.",
          code: "NOT_ALLOWED_ACCESS"
        }]
      });
      return;
    }

    // Prevent removing community admin if you're a moderator
    if (authUserMember.role === 'Community Moderator' && member.role === 'Community Admin') {
      res.status(403).json({
        status: false,
        errors: [{
          message: "Moderators cannot remove admins from the community.",
          code: "NOT_ALLOWED_ACCESS"
        }]
      });
      return;
    }

    // Remove member
    await prisma.member.delete({
      where: { id: memberId }
    });

    res.status(200).json({
      status: true
    });
  } catch (error) {
    next(error);
  }
});

export default router; 