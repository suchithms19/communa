import { Request, Response, NextFunction } from 'express';
import prisma from '../../loaders/v1/prisma';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    name: string | null;
    email: string;
  };
}

class MemberController {
  static async addMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
  }

  static async removeMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
            message: 'Member not found.',
            code: 'RESOURCE_NOT_FOUND'
          }]
        });
        return;
      }

      // Check if the authenticated user is an admin of the community
      const isAdmin = member.community.members.some(m => m.role === 'Community Admin');
      if (!isAdmin) {
        res.status(403).json({
          status: false,
          errors: [{
            message: 'You are not authorized to perform this action.',
            code: 'NOT_ALLOWED_ACCESS'
          }]
        });
        return;
      }

      // Delete member
      await prisma.member.delete({
        where: { id: memberId }
      });

      res.json({
        status: true
      });
    } catch (error) {
      next(error);
    }
  }
}

export default MemberController; 