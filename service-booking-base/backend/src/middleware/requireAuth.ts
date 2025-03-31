/**
 * Authentication Middleware
 * Protects routes by verifying JWT token
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '@utils/AppError';
import config from '@config/config';
import { prisma } from '@config/database';
import { UserModel } from '@features/users/user.model';

/**
 * Interface for decoded JWT payload
 */
interface DecodedToken {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Extend Express Request interface to include user property
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
      };
    }
  }
}

/**
 * Middleware to check if user is authenticated
 * Verifies JWT token in Authorization header and attaches user to request
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check if token exists
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required. Please log in.', StatusCodes.UNAUTHORIZED);
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret) as DecodedToken;
    
    // Find user in database based on database type
    let user;
    
    if (config.databaseType === 'mongo') {
      user = await UserModel.findById(decoded.id).select('-password');
    } else {
      user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });
    }

    // Check if user exists
    if (!user) {
      throw new AppError('The user belonging to this token no longer exists.', StatusCodes.UNAUTHORIZED);
    }

    // Attach user to request
    req.user = user;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again.', StatusCodes.UNAUTHORIZED));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your token has expired. Please log in again.', StatusCodes.UNAUTHORIZED));
    }
    next(error);
  }
}; 