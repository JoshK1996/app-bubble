/**
 * Authentication and Authorization middleware
 * Handles JWT verification and Role-Based Access Control (RBAC)
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '../types/role.enum';

// Define a type for the JWT payload
interface JwtPayload {
  userId: string;
  role: Role;
}

// Extend Express Request interface to include authenticated user information
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: Role;
      };
    }
  }
}

/**
 * Middleware to validate JWT tokens and extract user information
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Get token from authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Access denied. No token provided.' });
    return;
  }

  try {
    // Verify token and extract payload
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'default_jwt_secret',
    ) as JwtPayload;

    // Attach user information to request for use in route handlers
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

/**
 * Middleware to check if user has the required role
 * @param role Required role to access the resource
 * @returns Express middleware function
 */
export const requireRole = (role: Role) => {
  return (req: Request, res: Response, next: NextFunction): void => {
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