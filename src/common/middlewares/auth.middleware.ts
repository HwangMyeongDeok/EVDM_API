import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './AppError';
import { UserRole } from '../../modules/user/user.interface';
import { ENV } from '../../config';


declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
        dealer?: string;
      };
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication token is missing', 401));
  }

  try {
    const token = authHeader.split(' ')[1];

    const decodedPayload = jwt.verify(token, ENV.JWT_SECRET!) as any;

    req.user = {
      id: decodedPayload.id,
      role: decodedPayload.role,
      dealer: decodedPayload.dealer,
    };
    
    next();
  } catch (error) {
    return next(new AppError('Invalid token or expired', 401));
  }
};

export const checkRole = (requiredRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role) {
      return next(new AppError('User role not found', 401));
    }

    if (!requiredRoles.includes(req.user.role)) {
      return next(new AppError('Access denied', 403)); 
    }

    next();
  };
};