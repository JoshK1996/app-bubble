/**
 * Validation Middleware
 * 
 * This middleware provides request validation using express-validator.
 * It validates incoming request data against defined validation chains.
 */

import { Request, Response, NextFunction } from 'express';
import { ValidationChain, validationResult } from 'express-validator';

/**
 * Middleware to validate request data against validation chains
 * 
 * @param validations - Array of validation chains
 * @returns Middleware that validates the request
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Execute all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    // Get validation errors
    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      // No validation errors, proceed to the next middleware
      return next();
    }
    
    // Format the validation errors
    const formattedErrors = errors.array().map((error) => ({
      field: error.param,
      message: error.msg,
    }));
    
    // Return validation errors
    res.status(400).json({
      error: {
        message: 'Validation failed',
        errors: formattedErrors,
      },
    });
  };
}; 