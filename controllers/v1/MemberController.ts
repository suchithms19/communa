import { Request, Response, NextFunction } from 'express';
import MemberService from '@services/v1/MemberService';
import CommunityService from '@services/v1/CommunityService';
import UserService from '@services/v1/UserService';
import RoleService from '@services/v1/RoleService';
import { AuthenticatedRequest } from '@interfaces/v1/common';

class MemberController {
  static async addMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Parse IDs as integers
      const communityId = parseInt(req.body.community, 10);
      const userId = parseInt(req.body.user, 10);
      const roleId = parseInt(req.body.role, 10);

      if (!req.user || !req.user.id) {
        res.status(401).json({
          status: false,
          errors: [{ message: 'User not authenticated' }]
        });
        return;
      }

      // Check if community exists
      const community = await CommunityService.getSingle(communityId);
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

      // Check if the authenticated user is an admin of the community
      const isAdmin = await MemberService.checkCommunityAdmin(req.user.id, communityId);
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

      // Check if user exists
      const user = await UserService.getSingle(userId);
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
      const role = await RoleService.getSingle(roleId);
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

      // Check if member already exists
      const existingMember = await MemberService.checkMemberExistence(userId, communityId);
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
      const member = await MemberService.create({
        communityId,
        userId,
        role: role.name
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

      if (!req.user || !req.user.id) {
        res.status(401).json({
          status: false,
          errors: [{ message: 'User not authenticated' }]
        });
        return;
      }

      // Check if member exists
      const member = await MemberService.getSingle(memberId);
      
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
      const isAdmin = await MemberService.checkCommunityAdmin(req.user.id, member.communityId);
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
      await MemberService.delete(memberId);

      res.json({
        status: true,
        content: {
          data: {
            id: memberId.toString(),
            message: 'Member removed successfully'
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default MemberController; 