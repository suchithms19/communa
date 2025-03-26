import express, { Router, Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import prisma from '../config/prisma';
import auth from '../middlewares/auth';
import validate from '../middlewares/validate';

const router: Router = express.Router();

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    name: string | null;
    email: string;
  };
}

// Validation schemas
const createRoleSchema = Joi.object({
  name: Joi.string().min(2).required()
    .messages({
      'string.min': 'Name should be at least 2 characters.',
      'string.empty': 'Name is required.',
      'any.required': 'Name is required.',
    }),
});

// Create role
router.post('/', auth, validate(createRoleSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
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
});

// Get all roles
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
});

export default router; 