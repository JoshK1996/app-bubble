/**
 * Authentication Middleware
 * 
 * Middleware to validate JWT tokens and protect routes
 */

import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { logger } from '../utils/logger';

/**
 * Authenticates a request by validating the JWT token
 * 
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify the token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ message: 'Internal server error' });
    }

    // Decode the token
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    
    // Check if the decoded payload has the required user properties
    if (typeof decoded === 'object' && decoded !== null && 'id' in decoded && 'email' in decoded && 'role' in decoded) {
      // Assign the relevant properties to req.user, ensuring type compatibility
      req.user = {
        id: decoded.id as string,       // Assuming id is stored in the payload
        email: decoded.email as string,   // Assuming email is stored
        role: decoded.role as string,     // Assuming role is stored
      };
      next();
    } else {
      logger.error('Invalid token payload structure');
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expired' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    logger.error('Authentication error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}; 