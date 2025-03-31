/**
 * Auth Controller Placeholder
 * Handles HTTP requests for authentication.
 */
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { logger } from '../../config/logger';
import { StatusCodes } from 'http-status-codes';

export class AuthController {
  private authService = new AuthService();

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('[AuthController] Register request received');
      // TODO: Add validation middleware for req.body
      const result = await this.authService.registerUser(req.body);
      res.status(StatusCodes.CREATED).json(result);
    } catch (error) {
      logger.error('[AuthController] Registration error', { error });
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('[AuthController] Login request received');
       // TODO: Add validation middleware for req.body
      const result = await this.authService.loginUser(req.body);
      res.status(StatusCodes.OK).json(result);
    } catch (error) {
       logger.error('[AuthController] Login error', { error });
       next(error);
    }
  };

  getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
     try {
      logger.info('[AuthController] Get current user request received');
      // req.user should be populated by requireAuth middleware
      const userId = req.user?.id;
      if (!userId) {
          throw new Error('User ID not found on request. Ensure requireAuth middleware runs first.');
      }
      const user = await this.authService.getCurrentUser(userId);
      res.status(StatusCodes.OK).json(user);
    } catch (error) {
       logger.error('[AuthController] Get current user error', { error });
       next(error);
    }
  };
} 