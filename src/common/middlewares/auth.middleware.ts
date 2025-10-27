import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './AppError';
import { ENV } from '../../config';
import { UserRole } from '../../modules/user/user.model';

interface TokenPayload {
  user_id: number;
  role: UserRole;
  dealer_id?: number | null;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        user_id: number;
        role: UserRole;
        dealer_id?: number | null;
        email: string;
      };
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('Authentication token is missing', 401));
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, ENV.JWT_SECRET!) as TokenPayload;

    req.user = {
      user_id: decoded.user_id,
      role: decoded.role,
      dealer_id: decoded.dealer_id,
      email: decoded.email
    };

    next();
  } catch (error) {
    next(new AppError('Invalid or expired token', 401));
  }
};

export const checkRole = (requiredRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    if (!requiredRoles.includes(req.user.role)) {
      return next(new AppError('Access denied', 403));
    }

    next();
  };
};
