/**
 * Global Error Handling Middleware
 */
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { logger } from '@config/logger'; // Using path alias
import { AppError } from '@utils/AppError'; // Using path alias
import config from '@config/config'; // Using path alias
import { ZodError } from 'zod'; // Import ZodError for specific handling

export const errorHandler = (
  err: Error | AppError | ZodError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction, 
): void => {

  // Default error values
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = 'An internal server error occurred.';
  let status = 'error';
  let details: any = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details; // Include details if provided
    status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';

    if (!err.isOperational && config.nodeEnv === 'production') {
      logger.error('CRITICAL NON-OPERATIONAL AppError:', err);
      // Use generic message for critical production errors
      message = 'Something went very wrong!'; 
      statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
      status = 'error';
      details = undefined; // Don't leak details for critical errors in prod
    } else if (err.isOperational) {
       logger.warn(`Handled AppError: ${err.message}`, { statusCode, url: req.originalUrl, details });
    } else {
       logger.error(`Non-operational AppError: ${err.message}`, { statusCode, url: req.originalUrl, details, stack: err.stack });
    }

  } else if (err instanceof ZodError) {
      // Handle Zod validation errors specifically
      statusCode = StatusCodes.BAD_REQUEST;
      message = 'Input validation failed.';
      status = 'fail';
      details = err.errors.map((e) => ({ // Format errors for client
        field: e.path.join('.'),
        message: e.message,
      }));
      logger.warn('Zod Validation Error:', { details, url: req.originalUrl });

  } else {
    // Handle generic Errors or unknown errors
    logger.error('Unhandled Error Caught:', {
      error: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
    });
    // Keep generic message for production
    if (config.nodeEnv !== 'production') {
        message = err.message; // Show more details in dev
    }
  }

  // Construct the response object
  const responseObject: { status: string; message: string; details?: any; stack?: string } = {
    status,
    message,
  };

  // Include details if they exist (especially for validation errors)
  if (details) {
    responseObject.details = details;
  }

  // Include stack trace only in development for non-operational errors
  if (config.nodeEnv === 'development' && !(err instanceof AppError && err.isOperational)) {
    responseObject.stack = err.stack;
  }

  res.status(statusCode).json(responseObject);
}; 