import express, { Router, Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import validate from '../middlewares/validate';
import auth from '../middlewares/auth';

const router: Router = express.Router();

// Validation schemas
const signupSchema = Joi.object({
  name: Joi.string().min(2).required()
    .messages({
      'string.min': 'Name should be at least 2 characters.',
      'string.empty': 'Name is required.',
      'any.required': 'Name is required.'
    }),
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Please provide a valid email address.',
      'string.empty': 'Email is required.',
      'any.required': 'Email is required.'
    }),
  password: Joi.string().min(2).required()
    .messages({
      'string.min': 'Password should be at least 2 characters.',
      'string.empty': 'Password is required.',
      'any.required': 'Password is required.'
    })
});

const signinSchema = Joi.object({
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Please provide a valid email address.',
      'string.empty': 'Email is required.',
      'any.required': 'Email is required.'
    }),
  password: Joi.string().required()
    .messages({
      'string.empty': 'Password is required.',
      'any.required': 'Password is required.'
    })
});

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
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  const expiresIn = process.env.JWT_EXPIRY || '1d';
  
  return jwt.sign(
    { id: user.id },
    secret as jwt.Secret,
    { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] }
  );
};

// Signup route
router.post('/signup', validate(signupSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
});

// Signin route
router.post('/signin', validate(signinSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
});

// Get me route
router.get('/me', auth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
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
});

export default router; 