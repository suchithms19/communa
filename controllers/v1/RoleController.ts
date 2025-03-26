import { Request, Response, NextFunction } from 'express';
import RoleService from '@services/v1/RoleService';
import { AuthenticatedRequest } from '@interfaces/v1/common';

class RoleController {
  static async createRole(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          status: false,
          errors: [{ message: 'User not authenticated' }]
        });
        return;
      }

      const { name } = req.body;

      // Check if role already exists
      const existingRole = await RoleService.getByName(name);

      if (existingRole) {
        res.status(400).json({
          status: false,
          errors: [{ 
            param: 'name',
            message: 'Role with this name already exists.',
            code: 'RESOURCE_EXISTS'
          }]
        });
        return;
      }

      // Create a new role
      const role = await RoleService.create({
        name,
        permissions: [] // Default empty permissions
      });

      res.status(200).json({
        status: true,
        content: {
          data: {
            id: role.id.toString(),
            name: role.name,
            created_at: role.createdAt,
            updated_at: role.updatedAt
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllRoles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = 10;
      
      const result = await RoleService.getAll(page, limit);

      res.json({
        status: true,
        content: {
          meta: {
            total: result.total,
            pages: result.pages,
            page
          },
          data: result.roles.map((role: any) => ({
            id: role.id.toString(),
            name: role.name,
            created_at: role.createdAt,
            updated_at: role.updatedAt
          }))
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default RoleController;