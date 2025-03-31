"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Follow Routes
 * Defines API endpoints for follow relationships
 */
const express_1 = require("express");
const follow_controller_1 = require("./follow.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
// Create router instance
const followRouter = (0, express_1.Router)();
const followController = new follow_controller_1.FollowController();
/**
 * @swagger
 * /follow/{userId}:
 *   post:
 *     summary: Follow a user
 *     tags: [Follows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Follow relationship created successfully
 *       400:
 *         description: Invalid request (e.g., trying to follow yourself)
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: User to follow not found
 *       409:
 *         description: Already following this user
 */
followRouter.post('/:userId', auth_middleware_1.authenticate, followController.followUser);
/**
 * @swagger
 * /follow/{userId}:
 *   delete:
 *     summary: Unfollow a user
 *     tags: [Follows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Successfully unfollowed
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Not following this user
 */
followRouter.delete('/:userId', auth_middleware_1.authenticate, followController.unfollowUser);
/**
 * @swagger
 * /follow/{userId}/following:
 *   get:
 *     summary: Get users that a specified user is following
 *     tags: [Follows]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users that the specified user is following
 */
followRouter.get('/:userId/following', followController.getFollowing);
/**
 * @swagger
 * /follow/{userId}/followers:
 *   get:
 *     summary: Get users who follow the specified user
 *     tags: [Follows]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users who follow the specified user
 */
followRouter.get('/:userId/followers', followController.getFollowers);
/**
 * @swagger
 * /follow/{userId}/status:
 *   get:
 *     summary: Check if current authenticated user follows the specified user
 *     tags: [Follows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Follow status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isFollowing:
 *                   type: boolean
 *       401:
 *         description: Not authenticated
 */
followRouter.get('/:userId/status', auth_middleware_1.authenticate, followController.checkFollowStatus);
exports.default = followRouter;
//# sourceMappingURL=follow.routes.js.map