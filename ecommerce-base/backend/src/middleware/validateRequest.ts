/**
 * Request Validation Middleware
 */
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError, ZodType } from 'zod';
import { logger } from '@config/logger';

interface RequestValidationSchemas {
  body?: AnyZodObject;
  params?: AnyZodObject;
  query?: AnyZodObject;
}

// Helper function to extract schemas from nested objects
const extractSchemas = (schema: ZodType): RequestValidationSchemas => {
  const obj = schema as any;
  const result: RequestValidationSchemas = {};
  
  if (obj.shape?.body) {
    result.body = obj.shape.body;
  } else if (obj.body) {
    result.body = obj.body;
  }
  
  if (obj.shape?.params) {
    result.params = obj.shape.params;
  } else if (obj.params) {
    result.params = obj.params;
  }
  
  if (obj.shape?.query) {
    result.query = obj.shape.query;
  } else if (obj.query) {
    result.query = obj.query;
  }
  
  return result;
};

export const validateRequest = (schema: ZodType | RequestValidationSchemas) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Handle both direct schemas and our nested schemas
      const schemas = 'body' in schema || 'params' in schema || 'query' in schema
        ? schema as RequestValidationSchemas
        : extractSchemas(schema as ZodType);
      
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