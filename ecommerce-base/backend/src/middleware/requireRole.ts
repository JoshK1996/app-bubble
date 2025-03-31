/**
 * Role-Based Access Control Middleware (requireRole)
 * Only allows users with the specified role(s) to access protected routes.
 */
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '@utils/AppError';
import { logger } from '@config/logger';
import { Role } from '@src/types/role.enum';

/**
 * Middleware to restrict route access based on user role(s).
 * Must be used AFTER the requireAuth middleware, as it depends on req.user being set.
 * 
 * @param roles - Single role or array of roles allowed to access the route
 * @returns Middleware function that checks user roles
 */
export const requireRole = (roles: Role | Role[]) => {
  // Convert single role to array for consistent handling
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req: Request, res: Response, next: NextFunction): void => {
    // First check if user is authenticated
    if (!req.user) {
      logger.warn('[requireRole] Access attempt without authentication');
      return next(new AppError(
        'Authentication required before checking role permissions.', 
        StatusCodes.UNAUTHORIZED
      ));
    }

    // Check if user's role is in the allowed roles
    if (allowedRoles.includes(req.user.role)) {
      logger.debug(`[requireRole] User with role ${req.user.role} granted access`, {
        userId: req.user.id,
        allowedRoles,
      });
      return next();
    }

    // User does not have the required role
    logger.warn(`[requireRole] Insufficient permissions: user with role ${req.user.role} attempted to access restricted route`, {
      userId: req.user.id,
      path: req.path,
      method: req.method,
      requiredRoles: allowedRoles,
    });

    return next(new AppError(
      'Insufficient permissions to access this resource.',
      StatusCodes.FORBIDDEN
    ));
  };
};

/**
 * Convenience middleware that specifically requires ADMIN role.
 * Usage: router.get('/admin-only-route', requireAuth, requireAdmin, controllerFunction);
 */
export const requireAdmin = requireRole(Role.ADMIN);

/**
 * Convenience middleware that specifically requires CUSTOMER role.
 * Usage: router.get('/customer-only-route', requireAuth, requireCustomer, controllerFunction);
 */
export const requireCustomer = requireRole(Role.CUSTOMER); 