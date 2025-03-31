/**
 * Error Handler Middleware
 * Global error handling middleware for Express
 */
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { logger } from '@config/logger';
import { AppError } from '@utils/AppError';

/**
 * Global error handler for all errors passed to Express
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  // Default values
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = 'Something went wrong';
  let isOperational = false;

  // Check if error is an AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  } else if (err.name === 'ValidationError') {
    // Handle validation errors (e.g., from Mongoose)
    statusCode = StatusCodes.BAD_REQUEST;
    message = err.message;
    isOperational = true;
  } else if (err.name === 'JsonWebTokenError') {
    // Handle JWT errors
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'Invalid token. Please log in again.';
    isOperational = true;
  } else if (err.name === 'TokenExpiredError') {
    // Handle expired JWT
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'Your token has expired. Please log in again.';
    isOperational = true;
  }

  // Set status code for the response
  res.status(statusCode);

  // Log error details
  if (isOperational) {
    logger.warn(`Operational error: ${message}`);
  } else {
    // Programming or other unknown error
    logger.error('ERROR:', err);
  }

  // In development, send more detailed error information
  if (process.env.NODE_ENV === 'development') {
    res.json({
      success: false,
      error: {
        message,
        statusCode,
        stack: err.stack,
        isOperational,
      },
    });
  } else {
    // In production, don't expose error details
    res.json({
      success: false,
      message: isOperational ? message : 'Something went wrong',
    });
  }
}; 