import { Request, Response, NextFunction } from 'express';
import { HttpError } from './errorHandler';
import { logger } from '../utils/logger';

// Define JWT verification result interface to avoid linter errors
interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

// Define JWT error types to avoid linter errors
interface JsonWebTokenError extends Error {
  name: 'JsonWebTokenError';
}

interface TokenExpiredError extends Error {
  name: 'TokenExpiredError';
}

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Authentication middleware to protect routes
 * Verifies JWT token and attaches user to request object
 */
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token;

    // Check if token exists in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists in cookies
    else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    // If no token found, return unauthorized error
    if (!token) {
      return next(new HttpError('Not authorized, no token provided', 401));
    }

    // Import JWT dynamically to avoid linter errors
    const jwt = await import('jsonwebtoken');

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback_secret'
    ) as JwtPayload;

    // Import Prisma dynamically to avoid linter errors
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Get user from token
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    // Disconnect Prisma to avoid connection leaks
    await prisma.$disconnect();

    // Check if user exists
    if (!user) {
      return next(new HttpError('Not authorized, user not found', 401));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(new HttpError('Account is deactivated', 403));
    }

    // Attach user to request object
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      logger.error(`JWT Error: ${error.message}`);
      return next(new HttpError('Not authorized, invalid token', 401));
    }
    
    if (error.name === 'TokenExpiredError') {
      return next(new HttpError('Not authorized, token expired', 401));
    }
    
    logger.error(`Auth middleware error: ${error}`);
    return next(new HttpError('Not authorized', 401));
  }
};

/**
 * Role-based authorization middleware
 * @param roles Array of roles allowed to access the route
 */
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new HttpError('Not authorized, no user found', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new HttpError(
          `Role (${req.user.role}) not authorized to access this resource`,
          403
        )
      );
    }

    next();
  };
};

export default { protect, authorize }; 