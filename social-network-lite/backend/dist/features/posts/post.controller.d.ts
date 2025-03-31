/**
 * Post Controller
 * Handles HTTP requests related to posts in the social network
 */
import { Request, Response } from 'express';
/**
 * Controller for handling post-related HTTP requests
 */
export declare class PostController {
    private postService;
    /**
     * Initialize the controller with its dependencies
     */
    constructor();
    /**
     * Handle post creation
     * @param req Express request object
     * @param res Express response object
     */
    createPost: (req: Request, res: Response) => Promise<void>;
    /**
     * Handle getting a post by ID
     * @param req Express request object
     * @param res Express response object
     */
    getPostById: (req: Request, res: Response) => Promise<void>;
    /**
     * Handle getting posts for a user
     * @param req Express request object
     * @param res Express response object
     */
    getUserPosts: (req: Request, res: Response) => Promise<void>;
    /**
     * Handle getting feed posts (posts from followed users)
     * @param req Express request object
     * @param res Express response object
     */
    getFeedPosts: (req: Request, res: Response) => Promise<void>;
    /**
     * Handle updating a post
     * @param req Express request object
     * @param res Express response object
     */
    updatePost: (req: Request, res: Response) => Promise<void>;
    /**
     * Handle deleting a post
     * @param req Express request object
     * @param res Express response object
     */
    deletePost: (req: Request, res: Response) => Promise<void>;
}
