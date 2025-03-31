/**
 * Custom Error Class - AppError
 */
import { StatusCodes } from 'http-status-codes';

export class AppError extends Error {
  public readonly statusCode: StatusCodes;
  public readonly isOperational: boolean;
  public readonly details?: any; // Optional field for extra details (like validation errors)

  constructor(message: string, statusCode: StatusCodes, isOperational = true, details?: any) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    // Set prototype explicitly
    Object.setPrototypeOf(this, AppError.prototype);
  }
} 