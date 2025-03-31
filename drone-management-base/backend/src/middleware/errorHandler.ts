import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Interface for API error response
 */
export interface ApiError {
  status: number;
  message: string;
  timestamp: string;
  path: string;
  errors?: any[];
  stack?: string;
}

/**
 * Custom error class for API errors
 */
export class HttpError extends Error {
  status: number;
  errors?: any[];

  constructor(message: string, status = 500, errors?: any[]) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Define a type for Prisma errors to avoid linter issues
interface PrismaClientKnownRequestError extends Error {
  code: string;
  meta?: {
    target?: string[];
    [key: string]: any;
  };
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  let status = 500;
  let message = 'Internal Server Error';
  let errors: any[] | undefined;

  // Handle custom HttpError
  if (err instanceof HttpError) {
    status = err.status;
    message = err.message;
    errors = err.errors;
  }
  // Handle Prisma errors - check the name property since we might not have the type
  else if (err.name === 'PrismaClientKnownRequestError') {
    // Handle specific Prisma errors
    const prismaError = err as PrismaClientKnownRequestError;
    switch (prismaError.code) {
      case 'P2002': // Unique constraint failed
        status = 409;
        message = 'A record with this data already exists.';
        errors = [{ field: prismaError.meta?.target, error: 'Unique constraint violation' }];
        break;
      case 'P2025': // Record not found
        status = 404;
        message = 'The requested resource was not found.';
        break;
      default:
        message = 'Database error';
        break;
    }
  }
  // Handle validation errors
  else if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation error';
    errors = err.message.split(',');
  }
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Invalid or expired authentication token';
  }

  // Log the error
  if (status >= 500) {
    logger.error(`Server Error: ${err.message}`, { stack: err.stack });
  } else {
    logger.warn(`Client Error: ${err.message}`, { status, path: req.path });
  }

  // Create the error response
  const errorResponse: ApiError = {
    status,
    message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  };

  // Include detailed errors in non-production environments
  if (errors) {
    errorResponse.errors = errors;
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development' && err.stack) {
    errorResponse.stack = err.stack;
  }

  return res.status(status).json(errorResponse);
};

export default errorHandler; 