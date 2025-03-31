/**
 * Authentication Controller
 * Handles HTTP requests related to user authentication
 */
import { Request, Response } from 'express';
/**
 * Controller for handling authentication-related HTTP requests
 */
export declare class AuthController {
    private authService;
    /**
     * Initialize the controller with its dependencies
     */
    constructor();
    /**
     * Handle user registration
     * @param req Express request object
     * @param res Express response object
     */
    registerUser: (req: Request, res: Response) => Promise<void>;
    /**
     * Handle user login
     * @param req Express request object
     * @param res Express response object
     */
    loginUser: (req: Request, res: Response) => Promise<void>;
    /**
     * Get current authenticated user information
     * @param req Express request object (with user property from auth middleware)
     * @param res Express response object
     */
    getCurrentUser: (req: Request, res: Response) => Promise<void>;
}
