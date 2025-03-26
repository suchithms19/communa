import { Request } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../src/config/prisma';
import { RequestHandler } from 'express';
import Logger from '../universe/v1/libraries/logger';


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
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };

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
