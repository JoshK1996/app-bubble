/**
 * AppError Class
 * Custom error class for handling operational errors
 */
import { StatusCodes } from 'http-status-codes';

/**
 * AppError class for creating operational errors with status codes
 * 
 * This class extends the native Error class to include additional properties:
 * - statusCode: HTTP status code to return to the client
 * - isOperational: Flag to indicate if this is an expected operational error
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  
  /**
   * Create a new AppError
   * @param message Error message
   * @param statusCode HTTP status code (defaults to 500 INTERNAL_SERVER_ERROR)
   */
  constructor(message: string, statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    
    // Capture stack trace and exclude constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }
} 