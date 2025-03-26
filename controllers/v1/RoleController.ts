import { Request, Response, NextFunction } from 'express';
import prisma from '../../loaders/v1/prisma';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    name: string | null;
    email: string;
  };
}

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
      const existingRole = await prisma.role.findFirst({
        where: { name }
      });

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
      const role = await prisma.role.create({
        data: {
          name,
          permissions: [] // Default empty permissions
        }
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
      const skip = (page - 1) * limit;
      
      const [roles, total] = await Promise.all([
        prisma.role.findMany({
          orderBy: { createdAt: 'asc' },
          skip,
          take: limit
        }),
        prisma.role.count()
      ]);

      res.json({
        status: true,
        content: {
          meta: {
            total,
            pages: Math.ceil(total / limit),
            page
          },
          data: roles.map(role => ({
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