import express, { Router, Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import prisma from '../config/prisma';
import auth from '../middlewares/auth';
import validate from '../middlewares/validate';

const router: Router = express.Router();

// Function to generate slug from name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    name: string | null;
    email: string;
  };
}

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
router.post('/', auth, validate(createCommunitySchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name } = req.body;
    const slug = generateSlug(name);

    if (!req.user) {
      res.status(401).json({
        status: false,
        errors: [{ message: 'User not authenticated' }]
      });
      return;
    }

    // Create community and add owner as admin member
    const community = await prisma.community.create({
      data: {
        name,
        slug,
        members: {
          create: {
            userId: req.user.id,
            role: 'Community Admin'
          }
        }
      }
    });

    res.status(200).json({
      status: true,
      content: {
        data: {
          id: community.id.toString(),
          name: community.name,
          slug: community.slug,
          owner: req.user.id.toString(),
          created_at: community.createdAt,
          updated_at: community.updatedAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get all communities
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const [communities, total] = await Promise.all([
      prisma.community.findMany({
        include: {
          members: {
            where: { role: 'Community Admin' },
            include: { user: true }
          }
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit
      }),
      prisma.community.count()
    ]);

    res.json({
      status: true,
      content: {
        meta: {
          total,
          pages: Math.ceil(total / limit),
          page
        },
        data: communities.map(community => ({
          id: community.id.toString(),
          name: community.name,
          slug: community.slug,
          owner: community.members[0]?.user ? {
            id: community.members[0].user.id.toString(),
            name: community.members[0].user.name
          } : null,
          created_at: community.createdAt,
          updated_at: community.updatedAt
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get all communities owned by me
router.get('/me/owner', auth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: false,
        errors: [{ message: 'User not authenticated' }]
      });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const [communities, total] = await Promise.all([
      prisma.community.findMany({
        where: {
          members: {
            some: {
              userId: req.user.id,
              role: 'Community Admin'
            }
          }
        },
        include: {
          members: {
            where: { role: 'Community Admin' },
            include: { user: true }
          }
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit
      }),
      prisma.community.count({
        where: {
          members: {
            some: {
              userId: req.user.id,
              role: 'Community Admin'
            }
          }
        }
      })
    ]);

    res.json({
      status: true,
      content: {
        meta: {
          total,
          pages: Math.ceil(total / limit),
          page
        },
        data: communities.map(community => ({
          id: community.id.toString(),
          name: community.name,
          slug: community.slug,
          owner:community.members[0].user.id.toString(),
          created_at: community.createdAt,
          updated_at: community.updatedAt
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get all communities joined by me
router.get('/me/member', auth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: false,
        errors: [{ message: 'User not authenticated' }]
      });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const [memberships, total] = await Promise.all([
      prisma.member.findMany({
        where: { userId: req.user.id },
        include: {
          community: {
            include: {
              members: {
                where: { role: 'Community Admin' },
                include: { user: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit
      }),
      prisma.member.count({
        where: { userId: req.user.id }
      })
    ]);

    res.json({
      status: true,
      content: {
        meta: {
          total,
          pages: Math.ceil(total / limit),
          page
        },
        data: memberships.map(membership => ({
          id: membership.community.id.toString(),
          name: membership.community.name,
          slug: membership.community.slug,
          owner: membership.community.members[0]?.user ? {
            id: membership.community.members[0].user.id.toString(),
            name: membership.community.members[0].user.name
          } : null,
          created_at: membership.community.createdAt,
          updated_at: membership.community.updatedAt
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get community members
router.get('/:id/members', auth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Check if community exists
    const community = await prisma.community.findUnique({
      where: { id: parseInt(id, 10) }
    });

    if (!community) {
      res.status(404).json({
        status: false,
        errors: [{ 
          message: 'Community not found',
          code: 'RESOURCE_NOT_FOUND'
        }]
      });
      return;
    }

    // Get members of the community
    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where: { communityId: parseInt(id, 10) },
        include: {
          user: true
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit
      }),
      prisma.member.count({
        where: { communityId: parseInt(id, 10) }
      })
    ]);

    res.json({
      status: true,
      content: {
        meta: {
          total,
          pages: Math.ceil(total / limit),
          page
        },
        data: members.map(member => ({
          id: member.id,
          community: member.communityId,
          user: {
            id: member.user.id,
            name: member.user.name
          },
          role: {
            id:member.id,
            role:member.role,

          },
          created_at: member.createdAt
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router; 