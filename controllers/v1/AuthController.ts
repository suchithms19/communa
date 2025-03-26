import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@loaders/v1/prisma';
import Env from '@loaders/v1/Env';

interface User {
  id: number;
  name: string | null;
  email: string;
  password: string;
  createdAt: Date;
}

interface AuthenticatedRequest extends Request {
  user?: User;
}

// Generate JWT token
const generateToken = (user: User): string => {
  const secret = Env.variable.JWT_SECRET || 'your-secret-key';
  const expiresIn = Env.variable.JWT_EXPIRY || '1d';
  
  return jwt.sign(
    { id: user.id },
    secret as jwt.Secret,
    { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] }
  );
};

class AuthController {
  static async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      if (existingUser) {
        res.status(400).json({
          status: false,
          errors: [{ 
            param: 'email',
            message: 'User with this email address already exists.',
            code: 'RESOURCE_EXISTS'
          }]
        });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword
        }
      });

      const token = generateToken(user);

      res.status(200).json({
        status: true,
        content: {
          data: {
            id: user.id,
            name: user.name,
            email: user.email,
            created_at: user.createdAt
          },
          meta: {
            access_token: token
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async signin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      });
      if (!user) {
        res.status(400).json({
          status: false,
          errors: [{ 
            param: 'email',
            message: 'Please provide a valid email address.',
            code: 'INVALID_INPUT'
          }]
        });
        return;
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(400).json({
          status: false,
          errors: [{ 
            param: 'password',
            message: 'The credentials you provided are invalid.',
            code: 'INVALID_CREDENTIALS'
          }]
        });
        return;
      }

      const token = generateToken(user);

      res.json({
        status: true,
        content: {
          data: {
            id: user.id,
            name: user.name,
            email: user.email,
            created_at: user.createdAt
          },
          meta: {
            access_token: token
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          status: false,
          errors: [{ 
            message: 'User not authenticated',
            code: 'NOT_AUTHENTICATED'
          }]
        });
        return;
      }

      res.json({
        status: true,
        content: {
          data: {
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            created_at: req.user.createdAt
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController; 