/**
 * Global Error Handling Middleware
 * Catches errors passed via next(error) and sends appropriate JSON responses.
 */
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../config/logger';
import { AppError } from '../utils/AppError';
import config from '../config/config';

/**
 * Handles errors passed down the Express middleware chain.
 * Logs errors and sends a standardized JSON response.
 *
 * @param err - The error object.
 * @param req - Express Request object.
 * @param res - Express Response object.
 * @param next - Express NextFunction (unused here, but required by Express error handler signature).
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction, // Must include next for Express to recognize it as error handler
): void => {
  // Log the error initially
  logger.error(`Unhandled Error: ${err.message}`, {
    error: err,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  // Default error values
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = 'An unexpected error occurred on the server.';
  let status = 'error';

  if (err instanceof AppError) {
    // Handle operational errors (expected, like validation or not found)
    statusCode = err.statusCode;
    message = err.message;
    status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error'; // 'fail' for client errors, 'error' for server errors

    // If it's an AppError but not operational, treat it as a critical bug in production
    if (!err.isOperational && config.nodeEnv === 'production') {
      logger.error('CRITICAL NON-OPERATIONAL AppError:', err);
      message = 'Something went very wrong!'; // Generic message for critical prod errors
      statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
      status = 'error';
    }
  } else {
    // Handle programming or other unknown errors
    // In development, send more details
    if (config.nodeEnv === 'development') {
      message = err.message;
      // Optionally include stack trace in dev response (be cautious)
      // return res.status(statusCode).json({ status, message, stack: err.stack });
    } else {
       // In production, don't leak error details
      logger.error('CRITICAL UNHANDLED ERROR:', err);
      // Message is already set to the generic default
    }
  }

  // Send the JSON response
  res.status(statusCode).json({
    status,
    message,
    // Optionally include stack in development only
    ...(config.nodeEnv === 'development' && !(err instanceof AppError && err.isOperational) && { stack: err.stack }),
  });
}; 