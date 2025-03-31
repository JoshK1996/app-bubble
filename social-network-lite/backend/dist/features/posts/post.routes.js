"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Post Routes
 * Defines API endpoints for post operations
 */
const express_1 = require("express");
const post_controller_1 = require("./post.controller");
const post_validation_1 = require("./post.validation");
const auth_middleware_1 = require("../../middleware/auth.middleware");
// Create router instance
const postRouter = (0, express_1.Router)();
const postController = new post_controller_1.PostController();
/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authenticated
 */
postRouter.post('/', auth_middleware_1.authenticate, post_validation_1.createPostValidation, postController.createPost);
/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post fetched successfully
 *       404:
 *         description: Post not found
 */
postRouter.get('/:id', postController.getPostById);
/**
 * @swagger
 * /posts/user/{userId}:
 *   get:
 *     summary: Get all posts for a user
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Posts fetched successfully
 */
postRouter.get('/user/:userId', postController.getUserPosts);
/**
 * @swagger
 * /posts/feed:
 *   get:
 *     summary: Get feed posts (posts from followed users)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Feed posts fetched successfully
 *       401:
 *         description: Not authenticated
 */
postRouter.get('/feed', auth_middleware_1.authenticate, postController.getFeedPosts);
/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to update this post
 *       404:
 *         description: Post not found
 */
postRouter.put('/:id', auth_middleware_1.authenticate, post_validation_1.updatePostValidation, postController.updatePost);
/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Post deleted successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to delete this post
 *       404:
 *         description: Post not found
 */
postRouter.delete('/:id', auth_middleware_1.authenticate, postController.deletePost);
exports.default = postRouter;
//# sourceMappingURL=post.routes.js.map