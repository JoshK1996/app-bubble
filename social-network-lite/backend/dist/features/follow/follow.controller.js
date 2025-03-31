"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowController = void 0;
const follow_service_1 = require("./follow.service");
/**
 * Controller for handling follow-related HTTP requests
 */
class FollowController {
    /**
     * Initialize the controller with its dependencies
     */
    constructor() {
        /**
         * Follow a user
         * @param req Express request object with user property from auth middleware
         * @param res Express response object
         */
        this.followUser = async (req, res) => {
            try {
                // Ensure user is authenticated
                if (!req.user) {
                    res.status(401).json({ message: 'Authentication required' });
                    return;
                }
                const followerId = req.user.userId;
                const followingId = req.params.userId;
                // Follow user
                const result = await this.followService.followUser(followerId, followingId);
                // Return success response
                res.status(201).json(result);
            }
            catch (error) {
                // Handle service errors
                if (error instanceof Error) {
                    // Determine appropriate status code based on error message
                    if (error.message === 'You cannot follow yourself') {
                        res.status(400).json({ message: error.message });
                    }
                    else if (error.message === 'You are already following this user') {
                        res.status(409).json({ message: error.message });
                    }
                    else if (error.message === 'User to follow not found') {
                        res.status(404).json({ message: error.message });
                    }
                    else {
                        res.status(400).json({ message: error.message });
                    }
                }
                else {
                    res.status(500).json({ message: 'An unexpected error occurred' });
                }
            }
        };
        /**
         * Unfollow a user
         * @param req Express request object with user property from auth middleware
         * @param res Express response object
         */
        this.unfollowUser = async (req, res) => {
            try {
                // Ensure user is authenticated
                if (!req.user) {
                    res.status(401).json({ message: 'Authentication required' });
                    return;
                }
                const followerId = req.user.userId;
                const followingId = req.params.userId;
                // Unfollow user
                await this.followService.unfollowUser(followerId, followingId);
                // Return success response
                res.status(204).end();
            }
            catch (error) {
                // Handle service errors
                if (error instanceof Error) {
                    // Determine appropriate status code based on error message
                    if (error.message === 'You are not following this user') {
                        res.status(404).json({ message: error.message });
                    }
                    else {
                        res.status(400).json({ message: error.message });
                    }
                }
                else {
                    res.status(500).json({ message: 'An unexpected error occurred' });
                }
            }
        };
        /**
         * Get users that the specified user is following
         * @param req Express request object
         * @param res Express response object
         */
        this.getFollowing = async (req, res) => {
            try {
                const { userId } = req.params;
                // Get following list
                const following = await this.followService.getFollowing(userId);
                // Return success response
                res.status(200).json(following);
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
         * Get users who follow the specified user
         * @param req Express request object
         * @param res Express response object
         */
        this.getFollowers = async (req, res) => {
            try {
                const { userId } = req.params;
                // Get current user ID if authenticated (for checking follow status)
                const currentUserId = req.user?.userId;
                // Get followers list
                const followers = await this.followService.getFollowers(userId, currentUserId);
                // Return success response
                res.status(200).json(followers);
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
         * Check if current user follows another user
         * @param req Express request object with user property from auth middleware
         * @param res Express response object
         */
        this.checkFollowStatus = async (req, res) => {
            try {
                // Ensure user is authenticated
                if (!req.user) {
                    res.status(401).json({ message: 'Authentication required' });
                    return;
                }
                const followerId = req.user.userId;
                const followingId = req.params.userId;
                // Check follow status
                const isFollowing = await this.followService.checkFollowStatus(followerId, followingId);
                // Return success response
                res.status(200).json({ isFollowing });
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
        this.followService = new follow_service_1.FollowService();
    }
}
exports.FollowController = FollowController;
//# sourceMappingURL=follow.controller.js.map