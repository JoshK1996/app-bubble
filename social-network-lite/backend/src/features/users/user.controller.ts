/**
 * User Controller Placeholder
 * Handles HTTP requests for user-related actions.
 */
import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { logger } from '../../config/logger';
import { StatusCodes } from 'http-status-codes';

export class UserController {
  private userService = new UserService();

  getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.id;
      logger.info(`[UserController] Get user by ID request: ${userId}`);
      // TODO: Add validation for userId format
      const user = await this.userService.getUserById(userId);
      if (!user) {
        res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
        return;
      }
      res.status(StatusCodes.OK).json(user);
    } catch (error) {
      logger.error(`[UserController] Error getting user by ID: ${req.params.id}`, { error });
      next(error);
    }
  };
  
  getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            logger.info('[UserController] Get all users request');
            const users = await this.userService.getAllUsers();
            res.status(StatusCodes.OK).json(users);
        } catch (error) {
            logger.error('[UserController] Error getting all users', { error });
            next(error);
        }
    };

  // Add other controller methods (updateProfile, etc.) later
} 