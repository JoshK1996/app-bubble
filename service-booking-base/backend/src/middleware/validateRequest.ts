/**
 * Request Validation Middleware
 * Validates request data using zod schemas
 */
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AnyZodObject, ZodError } from 'zod';
import { logger } from '@config/logger';

/**
 * Middleware factory to validate request against a zod schema
 * 
 * @param schema - Zod schema to validate against
 * @returns Middleware function that validates request
 */
export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request against schema
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      // Continue to next middleware if validation passes
      next();
    } catch (error) {
      // Handle validation errors
      if (error instanceof ZodError) {
        logger.warn('Validation error:', error.errors);
        
        // Format error messages
        const errorMessages = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        
        // Send formatted errors in response
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Validation failed',
          errors: errorMessages,
        });
      } else {
        // Forward unexpected errors to error handler
        next(error);
      }
    }
  };
}; 