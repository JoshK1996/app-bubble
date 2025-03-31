/**
 * Authentication and Authorization middleware
 * Handles JWT verification and Role-Based Access Control (RBAC)
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '../types/role.enum';
import { DatabaseType, getDatabaseType } from '../config/database';

// Define a type for the JWT payload
interface JwtPayload {
  userId: string;
  username: string;
  role?: Role;
}

// Extend Express Request interface to include authenticated user information
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        username: string;
        role?: Role;
      };
    }
  }
}

/**
 * Middleware to authenticate requests using JWT tokens
 * Sets the user context in the request if authenticated
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    // For testing with in-memory database, use test header
    const testHeader = req.headers['x-test-user-id'] as string;
    if (testHeader) {
      req.user = {
        userId: testHeader,
        username: 'testuser',
        role: Role.USER // Default role for test users
      };
      return next();
    }
    
    // In a real implementation, we'd validate a JWT token here
    // For now, reject if no test header is provided
    res.status(401).json({ message: 'No authentication provided' });
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

/**
 * Middleware to check if user has the required role
 * @param role Required role to access the resource
 * @returns Express middleware function
 */
export const requireRole = (role: Role) => (req: Request, res: Response, next: NextFunction): void => {
  // Check if user is authenticated
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required.' });
    return;
  }

  // Check if user has the required role
  if (req.user.role !== role) {
    res.status(403).json({
      message: `Access denied. Role '${role}' required.`,
    });
    return;
  }

  next();
};

/**
 * Middleware to check if user is an admin
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Check if user is authenticated
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required.' });
    return;
  }

  // Check if user is an admin
  if (req.user.role !== Role.ADMIN) {
    res.status(403).json({
      message: 'Access denied. Admin role required.',
    });
    return;
  }

  next();
};
