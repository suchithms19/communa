import { Request } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '@loaders/v1/prisma';
import { RequestHandler } from 'express';
import Logger from '@universe/v1/libraries/logger';
import Env from '@loaders/v1/Env';


interface AuthenticatedRequest extends Request {
  user?: any;
  token?: string;
}

export const auth: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(400).json({
        status: false,
        errors: [{ message: 'You need to sign in to proceed.', code: 'NOT_SIGNEDIN' }],
      });
      return; 
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, Env.variable.JWT_SECRET as string) as { id: string };

    const user = await prisma.user.findUnique({
      where: { id: parseInt(decoded.id, 10) }
    });
    
    if (!user) {
      res.status(400).json({
        status: false,
        errors: [{ message: 'You need to sign in to proceed.', code: 'NOT_SIGNEDIN' }],
      });
      return; 
    }

    (req as AuthenticatedRequest).user = user;
    next(); 
  } catch (error) {
    Logger.instance.error('Auth Middleware Error:', error);
    res.status(400).json({
      status: false,
      errors: [{ message: 'Invalid token or session expired.', code: 'NOT_SIGNEDIN' }],
    });
    return; 
  }
};

export default auth;
