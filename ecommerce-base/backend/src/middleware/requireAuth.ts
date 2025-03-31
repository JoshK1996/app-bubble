/**
 * Authentication Middleware (requireAuth)
 */
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload as VerifiedJwtPayload } from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import config from '@config/config';
import { AppError } from '@utils/AppError';
import { logger } from '@config/logger';
import { Role } from '@src/types/role.enum';

// Define the structure of the user payload we expect AFTER verification
export interface UserPayload {
  id: string; 
  email: string;
  role: Role;
}

// Extend the Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required. Token missing.', StatusCodes.UNAUTHORIZED));
  }

  const token = authHeader.split(' ')[1];

  // The JWT secret is validated through Zod in the config
  // It's either a provided value or a default (for development)
  // Since we've validated it in config.ts with a default, we know it's always a string
  const JWT_SECRET = config.jwt.secret;

  try {
    // Since our config ensures JWT_SECRET is always a string, this is safe
    const decodedToken = jwt.verify(token, JWT_SECRET);

    // Check if decoded payload is an object
    if (typeof decodedToken === 'object' && decodedToken !== null) {
      // Cast to a more lenient type for property checks
      const decoded = decodedToken as Record<string, any>; 
      
      // Now check for expected fields and valid role
      if (decoded.id && 
          decoded.email && 
          decoded.role && 
          Object.values(Role).includes(decoded.role as Role))
      {
        const userPayload: UserPayload = {
          id: decoded.id as string,
          email: decoded.email as string,
          role: decoded.role as Role,
        };

        req.user = userPayload;
        logger.debug('[requireAuth] Token verified successfully.', { userId: userPayload.id });
        next();
      } else {
        // If payload structure is invalid after type check
        logger.error('[requireAuth] Invalid token payload structure after verification.', { decoded });
        throw new AppError('Invalid token payload structure.', StatusCodes.UNAUTHORIZED);
      }
    } else {
      // If decoded is not an object (e.g., just a string)
      logger.error('[requireAuth] Decoded token is not an object.', { decoded: decodedToken });
      throw new AppError('Invalid token format.', StatusCodes.UNAUTHORIZED);
    }
  } catch (error: any) {
    logger.warn('[requireAuth] Token verification failed.', { error: error.message });
    let errorMessage = 'Authentication failed. Invalid token.';
    if (error.name === 'TokenExpiredError') {
      errorMessage = 'Authentication failed. Token has expired.';
    } else if (error.name === 'JsonWebTokenError') {
      errorMessage = 'Authentication failed. Token is malformed.';
    }

    next(new AppError(errorMessage, StatusCodes.UNAUTHORIZED));
  }
}; 