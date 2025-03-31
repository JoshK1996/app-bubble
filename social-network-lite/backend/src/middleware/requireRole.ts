/**
 * Authorization Middleware (requireRole)
 * Checks if the authenticated user has one of the specified roles.
 */
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../utils/AppError';
import { logger } from '../config/logger';
import { Role } from '../types/role.enum';
// UserPayload is defined in requireAuth.ts
// requireAuth middleware must run before this one.

/**
 * Creates an Express middleware function that checks if the authenticated user
 * has at least one of the specified roles.
 *
 * @param allowedRoles - An array of roles that are allowed access.
 * @returns An Express middleware function.
 */
export const requireRole = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check if user object exists (meaning requireAuth has run successfully)
    if (!req.user) {
      logger.error('[requireRole] User object not found on request. Did requireAuth run first?');
      // This should technically not happen if requireAuth is used correctly before this middleware.
      return next(new AppError('Authentication required. User not found on request.', StatusCodes.UNAUTHORIZED));
    }

    const userRole = req.user.role;

    // Check if the user's role is included in the allowed roles
    if (!allowedRoles.includes(userRole)) {
      logger.warn(`[requireRole] Access denied for user ${req.user.id}. Role '${userRole}' is not in allowed list: [${allowedRoles.join(', ')}]`);
      return next(
        new AppError(
          `Forbidden. You do not have the required permissions (${allowedRoles.join(' or ')}) to access this resource.`,
          StatusCodes.FORBIDDEN,
        ),
      );
    }

    // User has the required role, proceed
    logger.debug(`[requireRole] Access granted for user ${req.user.id} with role ${userRole}. Allowed: [${allowedRoles.join(', ')}]`);
    next();
  };
};

/**
 * Convenience middleware function specifically for requiring the ADMIN role.
 */
export const requireAdmin = requireRole([Role.ADMIN]); 