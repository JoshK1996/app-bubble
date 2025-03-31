"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostController = void 0;
const express_validator_1 = require("express-validator");
const post_service_1 = require("./post.service");
/**
 * Controller for handling post-related HTTP requests
 */
class PostController {
    /**
     * Initialize the controller with its dependencies
     */
    constructor() {
        /**
         * Handle post creation
         * @param req Express request object
         * @param res Express response object
         */
        this.createPost = async (req, res) => {
            try {
                // Validate request data
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    res.status(400).json({ errors: errors.array() });
                    return;
                }
                // Ensure user is authenticated
                if (!req.user) {
                    res.status(401).json({ message: 'Authentication required' });
                    return;
                }
                // Extract post data from request body
                const postData = {
                    content: req.body.content,
                    userId: req.user.userId,
                };
                // Create post
                const result = await this.postService.createPost(postData);
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
         * Handle getting a post by ID
         * @param req Express request object
         * @param res Express response object
         */
        this.getPostById = async (req, res) => {
            try {
                const postId = req.params.id;
                // Get post
                const post = await this.postService.getPostById(postId);
                // Return success response
                res.status(200).json(post);
            }
            catch (error) {
                // Handle not found or other errors
                if (error instanceof Error && error.message === 'Post not found') {
                    res.status(404).json({ message: error.message });
                }
                else if (error instanceof Error) {
                    res.status(400).json({ message: error.message });
                }
                else {
                    res.status(500).json({ message: 'An unexpected error occurred' });
                }
            }
        };
        /**
         * Handle getting posts for a user
         * @param req Express request object
         * @param res Express response object
         */
        this.getUserPosts = async (req, res) => {
            try {
                const { userId } = req.params;
                // Get user posts
                const posts = await this.postService.getUserPosts(userId);
                // Return success response
                res.status(200).json(posts);
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
         * Handle getting feed posts (posts from followed users)
         * @param req Express request object
         * @param res Express response object
         */
        this.getFeedPosts = async (req, res) => {
            try {
                // Ensure user is authenticated
                if (!req.user) {
                    res.status(401).json({ message: 'Authentication required' });
                    return;
                }
                // Get feed posts
                const posts = await this.postService.getFeedPosts(req.user.userId);
                // Return success response
                res.status(200).json(posts);
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
         * Handle updating a post
         * @param req Express request object
         * @param res Express response object
         */
        this.updatePost = async (req, res) => {
            try {
                // Validate request data
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    res.status(400).json({ errors: errors.array() });
                    return;
                }
                // Ensure user is authenticated
                if (!req.user) {
                    res.status(401).json({ message: 'Authentication required' });
                    return;
                }
                const postId = req.params.id;
                const { userId } = req.user;
                // Extract update data from request body
                const updateData = {
                    content: req.body.content,
                };
                // Update post
                const updatedPost = await this.postService.updatePost(postId, userId, updateData);
                // Return success response
                res.status(200).json(updatedPost);
            }
            catch (error) {
                // Handle authorization, not found, or other errors
                if (error instanceof Error && error.message === 'Post not found') {
                    res.status(404).json({ message: error.message });
                }
                else if (error instanceof Error
                    && error.message === 'Not authorized to update this post') {
                    res.status(403).json({ message: error.message });
                }
                else if (error instanceof Error) {
                    res.status(400).json({ message: error.message });
                }
                else {
                    res.status(500).json({ message: 'An unexpected error occurred' });
                }
            }
        };
        /**
         * Handle deleting a post
         * @param req Express request object
         * @param res Express response object
         */
        this.deletePost = async (req, res) => {
            try {
                // Ensure user is authenticated
                if (!req.user) {
                    res.status(401).json({ message: 'Authentication required' });
                    return;
                }
                const postId = req.params.id;
                const { userId } = req.user;
                // Delete post
                await this.postService.deletePost(postId, userId);
                // Return success response
                res.status(204).end();
            }
            catch (error) {
                // Handle authorization, not found, or other errors
                if (error instanceof Error && error.message === 'Post not found') {
                    res.status(404).json({ message: error.message });
                }
                else if (error instanceof Error
                    && error.message === 'Not authorized to delete this post') {
                    res.status(403).json({ message: error.message });
                }
                else if (error instanceof Error) {
                    res.status(400).json({ message: error.message });
                }
                else {
                    res.status(500).json({ message: 'An unexpected error occurred' });
                }
            }
        };
        this.postService = new post_service_1.PostService();
    }
}
exports.PostController = PostController;
//# sourceMappingURL=post.controller.js.map