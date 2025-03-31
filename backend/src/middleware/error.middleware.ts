/**
 * Error Handling Middleware
 * 
 * This middleware provides centralized error handling for the application.
 * It handles different types of errors and returns appropriate responses.
 */

import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

/**
 * Custom API error class that can be used to throw specific HTTP errors
 */
export class ApiError extends Error {
  statusCode: number;
  
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

/**
 * Not found error handler middleware
 * Used when a requested resource is not found
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: {
      message: `Not Found - ${req.method} ${req.originalUrl}`,
    },
  });
};

/**
 * Global error handling middleware
 * Catches errors from route handlers and other middleware
 */
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
): void => {
  // Default to 500 if no status code is specified
  const statusCode = 'statusCode' in err ? err.statusCode : 500;
  const errorMessage = err.message || 'Internal Server Error';
  
  // Log the error
  console.error(`[ERROR] ${req.method} ${req.path} - ${err.message}`);
  if (err.stack) {
    console.error(err.stack);
  }
  
  // Send the error response
  res.status(statusCode).json({
    error: {
      message: errorMessage,
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

/**
 * Utility function to create common API errors
 */
export const createApiError = {
  badRequest: (message = 'Bad Request'): ApiError => new ApiError(400, message),
  unauthorized: (message = 'Unauthorized'): ApiError => new ApiError(401, message),
  forbidden: (message = 'Forbidden'): ApiError => new ApiError(403, message),
  notFound: (message = 'Not Found'): ApiError => new ApiError(404, message),
  conflict: (message = 'Conflict'): ApiError => new ApiError(409, message),
  internal: (message = 'Internal Server Error'): ApiError => new ApiError(500, message),
}; 