import { Request, Response, NextFunction } from 'express';
import CommunityService from '@services/v1/CommunityService';
import { AuthenticatedRequest } from '@interfaces/v1/common';


class CommunityController {
  static async createCommunity(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name } = req.body;

      if (!req.user || !req.user.id) {
        res.status(401).json({
          status: false,
          errors: [{ message: 'User not authenticated' }]
        });
        return;
      }

      // Create community and add owner as admin member
      const community = await CommunityService.create(name, req.user.id);

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

      const result = await CommunityService.getAll(page, limit);

      res.json({
        status: true,
        content: {
          meta: {
            total: result.total,
            pages: result.pages,
            page
          },
          data: result.communities.map(community => ({
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
      if (!req.user || !req.user.id) {
        res.status(401).json({
          status: false,
          errors: [{ message: 'User not authenticated' }]
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = 10;

      const result = await CommunityService.getUserCommunities(req.user.id, page, limit);

      res.json({
        status: true,
        content: {
          meta: {
            total: result.total,
            pages: result.pages,
            page
          },
          data: result.communities.map(community => ({
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
      if (!req.user || !req.user.id) {
        res.status(401).json({
          status: false,
          errors: [{ message: 'User not authenticated' }]
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = 10;

      const result = await CommunityService.getUserMemberships(req.user.id, page, limit);

      res.json({
        status: true,
        content: {
          meta: {
            total: result.total,
            pages: result.pages,
            page
          },
          data: result.communities.map(community => ({
            id: community.id.toString(),
            name: community.name,
            slug: community.slug,
            owner: community.members[0]?.user.id.toString(),
            created_at: community.createdAt,
            updated_at: community.updatedAt
          }))
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCommunityMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const communityId = parseInt(req.params.id);
      
      if (isNaN(communityId)) {
        res.status(400).json({
          status: false,
          errors: [{ message: 'Invalid community ID' }]
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await CommunityService.getCommunityMembers(communityId, page, limit);

      res.json({
        status: true,
        content: {
          meta: {
            total: result.total,
            pages: result.pages,
            page
          },
          data: result.members.map(member => {
            const roleInfo = result.roles[member.role] || { id: null, name: member.role };
            
            return {
              id: member.id.toString(),
              community: member.communityId.toString(),
              user: {
                id: member.user.id.toString(),
                name: member.user.name
              },
              role: {
                id: roleInfo.id ? roleInfo.id.toString() : '',
                name: roleInfo.name
              },
              created_at: member.createdAt
            };
          })
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default CommunityController; 