/**
 * Custom Error Class - AppError
 * Extends the base Error class to include an HTTP status code and an indication
 * of whether the error is operational (expected, like user input error) vs. a bug.
 */
import { StatusCodes } from 'http-status-codes';

export class AppError extends Error {
  public readonly statusCode: StatusCodes;
  public readonly isOperational: boolean;

  /**
   * Creates an instance of AppError.
   * @param message - The error message.
   * @param statusCode - The HTTP status code associated with the error.
   * @param isOperational - Flag indicating if this is an expected/operational error (default: true).
   */
  constructor(message: string, statusCode: StatusCodes, isOperational = true) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Properly capture stack trace in V8 environments (Node.js)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    // Set the prototype explicitly for correct instance checking
    Object.setPrototypeOf(this, AppError.prototype);
  }
} 