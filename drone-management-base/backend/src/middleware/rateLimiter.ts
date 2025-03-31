import { Express, Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// Define the rate limit options type to avoid linter errors
interface RateLimitOptions {
  windowMs: number;
  max: number;
  standardHeaders: boolean;
  legacyHeaders: boolean;
  message: string | object;
  statusCode?: number;
  handler?: (req: Request, res: Response, next: NextFunction, options: RateLimitOptions) => void;
}

/**
 * Configure and apply rate limiters to the Express app
 * @param app Express application
 */
export const configureRateLimits = async (app: Express): Promise<void> => {
  try {
    // Dynamically import express-rate-limit to avoid type issues
    const rateLimitModule = await import('express-rate-limit');
    const rateLimit = rateLimitModule.default;

    // General API rate limiter
    const apiLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per window
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
      message: 'Too many requests from this IP, please try again after 15 minutes',
      handler: (req, res, next, options) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(options.statusCode || 429).json({
          message: options.message,
          status: 'error',
          timestamp: new Date().toISOString(),
        });
      },
    });

    // More strict limiter for authentication routes
    const authLimiter = rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // Limit each IP to 10 requests per hour
      standardHeaders: true,
      legacyHeaders: false,
      message: 'Too many authentication attempts, please try again after an hour',
      handler: (req, res, next, options) => {
        logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
        res.status(options.statusCode || 429).json({
          message: options.message,
          status: 'error',
          timestamp: new Date().toISOString(),
        });
      },
    });

    // Apply rate limiters to routes
    app.use('/api/', apiLimiter);
    app.use('/api/auth/', authLimiter);
    app.use('/api/users/login', authLimiter);
    app.use('/api/users/register', authLimiter);

    logger.info('Rate limiters configured');
  } catch (error) {
    logger.error('Failed to configure rate limiters:', error);
    // Continue without rate limiting rather than crashing the app
  }
};

export default { configureRateLimits }; 