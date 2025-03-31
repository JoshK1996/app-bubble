/**
 * Post Routes
 * Defines API endpoints for post operations
 */
import { Router } from 'express';
import { PostController } from './post.controller';
import { createPostValidation, updatePostValidation } from './post.validation';
import { authenticate } from '../../middleware/auth.middleware';

// Create router instance
const postRouter = Router();
const postController = new PostController();

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
postRouter.post(
  '/',
  authenticate,
  createPostValidation,
  postController.createPost,
);

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
postRouter.get('/feed', authenticate, postController.getFeedPosts);

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
postRouter.put(
  '/:id',
  authenticate,
  updatePostValidation,
  postController.updatePost,
);

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
postRouter.delete('/:id', authenticate, postController.deletePost);

export default postRouter;
