import { Request, Response, NextFunction } from 'express';
import { HttpError } from './errorHandler';

/**
 * 404 Not Found handler middleware
 * This middleware is used for routes that don't match any defined routes
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new HttpError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};

export default notFoundHandler; 