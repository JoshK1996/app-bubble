/**
 * Authentication Middleware (requireAuth)
 * Verifies JWT token from the Authorization header and attaches user payload to the request.
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import config from '../config/config';
import { AppError } from '../utils/AppError';
import { logger } from '../config/logger';
import { Role } from '../types/role.enum'; // Needed for UserPayload type

// Define the structure of the JWT payload
export interface UserPayload {
  id: string; // User ID (UUID) - Using 'id' consistently
  email: string;
  role: Role;
  // Add any other relevant fields from your user model that you want in the payload
}

// Extend the Express Request interface to include the user payload
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

/**
 * Middleware to verify JWT token and authenticate the user.
 *
 * @param req - Express Request object.
 * @param res - Express Response object.
 * @param next - Express NextFunction.
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('[requireAuth] No Bearer token provided.');
    return next(new AppError('Authentication required. No token provided.', StatusCodes.UNAUTHORIZED));
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token using the secret
    const decoded = jwt.verify(token, config.jwt.secret) as UserPayload;

    // Basic validation of payload structure
    if (!decoded || !decoded.id || !decoded.email || !decoded.role) {
        logger.error('[requireAuth] Invalid token payload structure.', { decoded });
        throw new AppError('Invalid token payload.', StatusCodes.UNAUTHORIZED);
    }

    // Attach the decoded user payload to the request object
    req.user = decoded;
    logger.debug('[requireAuth] Token verified successfully.', { userId: decoded.id });
    next(); // Proceed to the next middleware/route handler
  } catch (error: any) {
    logger.error('[requireAuth] Token verification failed.', { error: error.message });

    let errorMessage = 'Authentication failed. Invalid token.';
    if (error.name === 'TokenExpiredError') {
      errorMessage = 'Authentication failed. Token has expired.';
    }
    // Add handling for other specific JWT errors if needed (e.g., JsonWebTokenError for malformed tokens)

    next(new AppError(errorMessage, StatusCodes.UNAUTHORIZED));
  }
}; 