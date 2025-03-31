"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const express_validator_1 = require("express-validator");
const auth_service_1 = require("./auth.service");
/**
 * Controller for handling authentication-related HTTP requests
 */
class AuthController {
    /**
     * Initialize the controller with its dependencies
     */
    constructor() {
        /**
         * Handle user registration
         * @param req Express request object
         * @param res Express response object
         */
        this.registerUser = async (req, res) => {
            try {
                // Validate request data
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    res.status(400).json({ errors: errors.array() });
                    return;
                }
                // Extract user data from request body
                const userData = {
                    email: req.body.email,
                    username: req.body.username,
                    password: req.body.password,
                    fullName: req.body.fullName,
                };
                // Register user
                const result = await this.authService.register(userData);
                // Return success response
                res.status(201).json(result);
            }
            catch (error) {
                // Handle service errors
                if (error instanceof Error) {
                    res.status(400).json({ message: error.message });
                }
                else {
                    res.status(500).json({ message: 'An unexpected error occurred' });
                }
            }
        };
        /**
         * Handle user login
         * @param req Express request object
         * @param res Express response object
         */
        this.loginUser = async (req, res) => {
            try {
                // Validate request data
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    res.status(400).json({ errors: errors.array() });
                    return;
                }
                // Extract login credentials from request body
                const loginData = {
                    email: req.body.email,
                    password: req.body.password,
                };
                // Authenticate user
                const result = await this.authService.login(loginData);
                // Return success response
                res.status(200).json(result);
            }
            catch (error) {
                // Handle authentication failure
                if (error instanceof Error) {
                    res.status(401).json({ message: error.message });
                }
                else {
                    res.status(500).json({ message: 'An unexpected error occurred' });
                }
            }
        };
        /**
         * Get current authenticated user information
         * @param req Express request object (with user property from auth middleware)
         * @param res Express response object
         */
        this.getCurrentUser = async (req, res) => {
            try {
                // Check if user is authenticated
                if (!req.user) {
                    res.status(401).json({ message: 'Authentication required' });
                    return;
                }
                // Retrieve user data
                const user = await this.authService.getCurrentUser(req.user.userId);
                // Return user information
                res.status(200).json({ user });
            }
            catch (error) {
                // Handle user retrieval errors
                if (error instanceof Error) {
                    res.status(404).json({ message: error.message });
                }
                else {
                    res.status(500).json({ message: 'An unexpected error occurred' });
                }
            }
        };
        this.authService = new auth_service_1.AuthService();
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map