/**
 * Request Validation Middleware
 */
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { logger } from '@config/logger';

interface RequestValidationSchemas {
  body?: AnyZodObject;
  params?: AnyZodObject;
  query?: AnyZodObject;
}

export const validateRequest = (schemas: RequestValidationSchemas) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
        logger.debug('[validateRequest] Body validated.');
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
        logger.debug('[validateRequest] Params validated.');
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
        logger.debug('[validateRequest] Query validated.');
      }
      next();
    } catch (error) {
      // ZodErrors will be caught and formatted by the global errorHandler
      // Pass other errors along
      if (!(error instanceof ZodError)) {
           logger.error('[validateRequest] Unexpected error during validation.', { error });
      }
      next(error);
    }
  };
}; 