import { Request, Response, NextFunction } from 'express';
import AuthService from '@services/v1/AuthService';
import { AuthenticatedRequest } from '@interfaces/v1/common';
import { IUser } from '@interfaces/v1/user';

class AuthController {
  static async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await AuthService.findUserByEmail(email);
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

      // Create new user
      const user = await AuthService.createUser({ name, email, password });

      // Generate token
      const token = AuthService.generateToken(user as IUser);

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
      const user = await AuthService.findUserByEmail(email);
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
      const isMatch = await AuthService.verifyPassword(password, user.password);
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

      const token = AuthService.generateToken(user as IUser);

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