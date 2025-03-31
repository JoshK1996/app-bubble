/**
 * Role-Based Access Control Middleware
 * Restricts access to routes based on user roles
 */
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '@utils/AppError';
import { Role } from '@src/types/role.enum';

/**
 * Middleware factory to check if user has required roles
 * 
 * @param roles - Array of roles allowed to access the route
 * @returns Middleware function that checks user role
 */
export const requireRole = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check if user exists and has been authenticated
    if (!req.user) {
      return next(new AppError('Authentication required. Please log in.', StatusCodes.UNAUTHORIZED));
    }

    // Check if user's role is in the allowed roles array
    if (!roles.includes(req.user.role as Role)) {
      return next(
        new AppError(
          'You do not have permission to perform this action.',
          StatusCodes.FORBIDDEN
        )
      );
    }

    // User has required role, proceed to next middleware
    next();
  };
}; 