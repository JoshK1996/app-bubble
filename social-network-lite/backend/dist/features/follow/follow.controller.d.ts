/**
 * Follow Controller
 * Handles HTTP requests related to follow relationships
 */
import { Request, Response } from 'express';
/**
 * Controller for handling follow-related HTTP requests
 */
export declare class FollowController {
    private followService;
    /**
     * Initialize the controller with its dependencies
     */
    constructor();
    /**
     * Follow a user
     * @param req Express request object with user property from auth middleware
     * @param res Express response object
     */
    followUser: (req: Request, res: Response) => Promise<void>;
    /**
     * Unfollow a user
     * @param req Express request object with user property from auth middleware
     * @param res Express response object
     */
    unfollowUser: (req: Request, res: Response) => Promise<void>;
    /**
     * Get users that the specified user is following
     * @param req Express request object
     * @param res Express response object
     */
    getFollowing: (req: Request, res: Response) => Promise<void>;
    /**
     * Get users who follow the specified user
     * @param req Express request object
     * @param res Express response object
     */
    getFollowers: (req: Request, res: Response) => Promise<void>;
    /**
     * Check if current user follows another user
     * @param req Express request object with user property from auth middleware
     * @param res Express response object
     */
    checkFollowStatus: (req: Request, res: Response) => Promise<void>;
}
