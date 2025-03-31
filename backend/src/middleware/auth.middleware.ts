/**
 * Authentication Middleware
 * 
 * This middleware handles JWT authentication and role-based access control for protected routes.
 * It verifies the token from the Authorization header and attaches the user to the request object.
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../shared/services/auth.service';
import { UserRole, UserRoles, JwtPayload } from '../features/users/user.types';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware to authenticate user requests via JWT token
 * 
 * Extracts the token from Authorization header, verifies it,
 * and attaches the decoded user to the request object.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Authentication required. No token provided.' });
      return;
    }
    
    // Extract the token (remove 'Bearer ' prefix)
    const token = authHeader.split(' ')[1];
    
    // Verify the token and get the user payload
    const user = verifyToken(token);
    
    // Attach the user to the request object
    req.user = user;
    
    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed. Invalid token.' });
  }
};

/**
 * Middleware factory to restrict access to specific user roles
 * 
 * @param roles - Array of allowed user roles
 * @returns Middleware that checks if the authenticated user has one of the allowed roles
 */
export const requireRoles = (roles: UserRole[]) => (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  
  if (!roles.includes(req.user.role)) {
    res.status(403).json({
      message: 'Access denied. Insufficient permissions.',
    });
    return;
  }
  
  next();
};

/**
 * Middleware to restrict access to ADMIN users only
 */
export const requireAdmin = requireRoles([UserRoles.ADMIN]);

/**
 * Middleware to restrict access to the user's own resources
 * 
 * @param getUserId - Function to extract the user ID from the request
 */
export const requireOwnership = (
  getUserId: (req: Request) => string,
) => (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  
  const resourceUserId = getUserId(req);
  
  // Allow admins to access any user's resources
  if (req.user.role === UserRoles.ADMIN) {
    next();
    return;
  }
  
  // Check if the user is accessing their own resource
  if (req.user.userId !== resourceUserId) {
    res.status(403).json({
      message: 'Access denied. You can only access your own resources.',
    });
    return;
  }
  
  next();
}; 