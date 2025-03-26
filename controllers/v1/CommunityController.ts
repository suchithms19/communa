import { Request, Response, NextFunction } from 'express';
import prisma from '../../loaders/v1/prisma';

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

class CommunityController {
  static async createCommunity(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
  }

  static async getAllCommunities(req: Request, res: Response, next: NextFunction): Promise<void> {
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
  }

  static async getMyCommunities(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
            owner: community.members[0].user.id.toString(),
            created_at: community.createdAt,
            updated_at: community.updatedAt
          }))
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyMemberships(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
                userId: req.user.id
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
                userId: req.user.id
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
  }
}

export default CommunityController; 