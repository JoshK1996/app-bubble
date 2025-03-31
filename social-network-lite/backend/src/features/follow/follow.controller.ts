/**
 * Follow Controller
 * Handles HTTP requests related to following/unfollowing users.
 */
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { FollowService } from './follow.service';
import { AppError } from '../../utils/AppError';
import { logger } from '../../config/logger';
import { UserPayload } from '../../middleware/requireAuth'; // Import UserPayload

/**
 * Controller for handling follow-related HTTP requests
 */
export class FollowController {
  private followService = new FollowService();

  /**
   * Handles POST /api/follow/:id - Follow a user
   */
  followUser = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const followerId = req.user?.id; // Authenticated user's ID from requireAuth
      const followingId = req.params.id; // ID of the user to follow from URL parameter

      if (!followerId) {
        // This should ideally be caught by requireAuth, but double-check
        return next(new AppError('Authentication required.', StatusCodes.UNAUTHORIZED));
      }
      // Basic validation for the target ID (more specific format validation might be in middleware)
       if (!followingId) {
            return next(new AppError('User ID to follow is required in URL parameter.', StatusCodes.BAD_REQUEST));
       }

      logger.info(`[FollowController] Request received: User ${followerId} to follow ${followingId}`);
      const followResult = await this.followService.followUser(followerId, followingId);
      logger.info(`[FollowController] Follow successful: User ${followerId} followed ${followingId}`);
      res.status(StatusCodes.CREATED).json(followResult);

    } catch (error) {
      logger.error('[FollowController] Error following user', { error, followerId: req.user?.id, followingId: req.params.id });
      next(error); // Pass to global error handler
    }
  };

  /**
   * Handles DELETE /api/follow/:id - Unfollow a user
   */
  unfollowUser = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
     try {
      const followerId = req.user?.id;
      const followingId = req.params.id;

      if (!followerId) {
        return next(new AppError('Authentication required.', StatusCodes.UNAUTHORIZED));
      }
       if (!followingId) {
            return next(new AppError('User ID to unfollow is required in URL parameter.', StatusCodes.BAD_REQUEST));
       }

      logger.info(`[FollowController] Request received: User ${followerId} to unfollow ${followingId}`);
      const success = await this.followService.unfollowUser(followerId, followingId);

      if (success) {
          logger.info(`[FollowController] Unfollow successful: User ${followerId} unfollowed ${followingId}`);
          res.status(StatusCodes.NO_CONTENT).send();
      } else {
           logger.warn(`[FollowController] Unfollow attempt: User ${followerId} was not following ${followingId}.`);
           // Return OK status even if not previously following, as the state is achieved
           res.status(StatusCodes.OK).json({ message: 'You were not following this user.' });
           // Or potentially NO_CONTENT or NOT_FOUND depending on API design choice
           // throw new AppError('You are not following this user.', StatusCodes.NOT_FOUND);
      }

    } catch (error) {
       logger.error('[FollowController] Error unfollowing user', { error, followerId: req.user?.id, followingId: req.params.id });
       next(error);
    }
  };

  /**
   * Handles GET /api/follow/:id/status - Check follow status
   */
  checkFollowStatus = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
      try {
          const followerId = req.user?.id;
          const followingId = req.params.id;

          if (!followerId) {
              return next(new AppError('Authentication required.', StatusCodes.UNAUTHORIZED));
          }
          if (!followingId) {
              return next(new AppError('Target user ID is required in URL parameter.', StatusCodes.BAD_REQUEST));
          }

          logger.debug(`[FollowController] Checking follow status: ${followerId} -> ${followingId}`);
          const isFollowing = await this.followService.checkFollowStatus(followerId, followingId);
          logger.debug(`[FollowController] Follow status result: ${isFollowing}`);
          res.status(StatusCodes.OK).json({ isFollowing });

      } catch (error) {
          logger.error('[FollowController] Error checking follow status', { error, followerId: req.user?.id, followingId: req.params.id });
          next(error);
      }
  };

  /**
   * Handles GET /api/follow/:id/following - Get users someone is following
   */
  getFollowing = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
      try {
          const userId = req.params.id; // User whose following list we want
          if (!userId) {
              return next(new AppError('User ID is required in URL parameter.', StatusCodes.BAD_REQUEST));
          }

          logger.debug(`[FollowController] Getting following list for user: ${userId}`);
          const followingList = await this.followService.getFollowing(userId);
          logger.debug(`[FollowController] Found ${followingList.length} users followed by ${userId}.`);
          res.status(StatusCodes.OK).json(followingList);

      } catch (error) {
          logger.error('[FollowController] Error getting following list', { error, userId: req.params.id });
          next(error);
      }
  };

  /**
   * Handles GET /api/follow/:id/followers - Get followers of someone
   */
  getFollowers = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
      try {
          const userId = req.params.id; // User whose followers list we want
          if (!userId) {
              return next(new AppError('User ID is required in URL parameter.', StatusCodes.BAD_REQUEST));
          }

          logger.debug(`[FollowController] Getting followers list for user: ${userId}`);
          const followersList = await this.followService.getFollowers(userId);
          logger.debug(`[FollowController] Found ${followersList.length} followers for user ${userId}.`);
          res.status(StatusCodes.OK).json(followersList);

      } catch (error) {
          logger.error('[FollowController] Error getting followers list', { error, userId: req.params.id });
          next(error);
      }
  };
}
