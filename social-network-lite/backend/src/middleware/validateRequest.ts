/**
 * Request Validation Middleware
 * Uses Zod schemas to validate request bodies, params, and query against provided schemas.
 */
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../utils/AppError';
import { logger } from '../config/logger';

interface RequestValidationSchemas {
  body?: AnyZodObject;
  params?: AnyZodObject;
  query?: AnyZodObject;
}

/**
 * Creates an Express middleware function that validates parts of the request
 * against provided Zod schemas.
 *
 * @param schemas - An object containing optional Zod schemas for body, params, and query.
 * @returns An Express middleware function.
 */
export const validateRequest = (schemas: RequestValidationSchemas) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request body if schema is provided
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
        logger.debug('[validateRequest] Request body validated successfully.', { body: req.body });
      }

      // Validate request params if schema is provided
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
        logger.debug('[validateRequest] Request params validated successfully.', { params: req.params });
      }

      // Validate request query if schema is provided
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
        logger.debug('[validateRequest] Request query validated successfully.', { query: req.query });
      }

      // If all validations pass, move to the next middleware/handler
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors for a user-friendly response
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        logger.warn('[validateRequest] Validation failed.', { errors: formattedErrors });
        // Use AppError to send a standardized 400 Bad Request response
        next(new AppError('Input validation failed', StatusCodes.BAD_REQUEST, true));
      } else {
        // Pass other unexpected errors to the global error handler
        logger.error('[validateRequest] Unexpected error during validation.', { error });
        next(error);
      }
    }
  };
};

// Extend AppError to include validation errors (optional refinement)
interface ValidationErrorDetail {
  field: string;
  message: string;
}

export class AppValidationError extends AppError {
  public readonly validationErrors: ValidationErrorDetail[];

  constructor(message: string, statusCode: StatusCodes, validationErrors: ValidationErrorDetail[], isOperational = true) {
    super(message, statusCode, isOperational);
    this.validationErrors = validationErrors;
    Object.setPrototypeOf(this, AppValidationError.prototype);
  }

  // Optionally, modify the toJSON or how the error is handled in errorHandler
  // to include validationErrors in the response body.
}

// Modify the catch block in validateRequest to use AppValidationError:
/*
      } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        logger.warn('[validateRequest] Validation failed.', { errors: formattedErrors });
        next(new AppValidationError('Input validation failed', StatusCodes.BAD_REQUEST, formattedErrors));
      } else {
        logger.error('[validateRequest] Unexpected error during validation.', { error });
        next(error);
      }
    }
*/ 