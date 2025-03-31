/**
 * Follow Routes
 * Defines API routes for following/unfollowing users and retrieving follow lists.
 */
import { Router } from 'express';
import { FollowController } from './follow.controller';
import { requireAuth } from '../../middleware/requireAuth';
import { validateRequest } from '../../middleware/validateRequest';
import { z } from 'zod';

// Define Zod schema for ID parameter validation
const userIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid User ID format (must be a UUID).' }),
});

// Create router instance
const followRouter = Router();

// Instantiate controller
const followController = new FollowController();

// --- Protected Routes (Require Authentication) ---

// NOTE: Order matters. Specific paths like /:id/status should come before generic /:id

/**
 * @openapi
 * /api/follow/{id}/status:
 *   get:
 *     tags:
 *       - Follows
 *     summary: Check if current user follows another user
 *     description: Determines if the currently authenticated user is following the user specified by ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the user to check follow status against.
 *     responses:
 *       200:
 *         description: Follow status.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isFollowing:
 *                   type: boolean
 *       400:
 *         description: Invalid User ID format.
 *       401:
 *         description: Unauthorized (not logged in).
 *       500:
 *         description: Internal server error.
 */
followRouter.get(
    '/:id/status',
    requireAuth, // User must be logged in to check their status
    validateRequest({ params: userIdParamSchema }),
    followController.checkFollowStatus
);

/**
 * @openapi
 * /api/follow/{id}/following:
 *   get:
 *     tags:
 *       - Follows
 *     summary: Get users a specific user is following
 *     description: Retrieves a list of users that the user specified by ID is following. Authentication may or may not be required depending on privacy settings (public for now).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the user whose following list is requested.
 *     responses:
 *       200:
 *         description: A list of users being followed.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserSummary' # Assuming a UserSummary schema exists
 *       400:
 *         description: Invalid User ID format.
 *       404:
 *         description: User not found (if applicable).
 *       500:
 *         description: Internal server error.
 */
followRouter.get(
    '/:id/following',
    // requireAuth, // Optional: Add auth if this should be private
    validateRequest({ params: userIdParamSchema }),
    followController.getFollowing
);

/**
 * @openapi
 * /api/follow/{id}/followers:
 *   get:
 *     tags:
 *       - Follows
 *     summary: Get followers of a specific user
 *     description: Retrieves a list of users who are following the user specified by ID. Authentication may or may not be required depending on privacy settings (public for now).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the user whose followers list is requested.
 *     responses:
 *       200:
 *         description: A list of followers.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserSummary'
 *       400:
 *         description: Invalid User ID format.
 *       404:
 *         description: User not found (if applicable).
 *       500:
 *         description: Internal server error.
 */
followRouter.get(
    '/:id/followers',
    // requireAuth, // Optional: Add auth if this should be private
    validateRequest({ params: userIdParamSchema }),
    followController.getFollowers
);

/**
 * @openapi
 * /api/follow/{id}:
 *   post:
 *     tags:
 *       - Follows
 *     summary: Follow a user
 *     description: Creates a follow relationship from the currently authenticated user to the user specified by ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the user to follow.
 *     responses:
 *       201:
 *         description: Follow successful.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FollowRelationship' # Assuming schema exists
 *       400:
 *         description: Invalid User ID format or cannot follow self.
 *       401:
 *         description: Unauthorized.
 *       409:
 *         description: Conflict (already following).
 *       500:
 *         description: Internal server error.
 */
followRouter.post(
    '/:id',
    requireAuth,
    validateRequest({ params: userIdParamSchema }),
    followController.followUser
);

/**
 * @openapi
 * /api/follow/{id}:
 *   delete:
 *     tags:
 *       - Follows
 *     summary: Unfollow a user
 *     description: Removes a follow relationship from the currently authenticated user to the user specified by ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the user to unfollow.
 *     responses:
 *       204:
 *         description: Unfollow successful (No Content).
 *       200: # Or 200 if returning a message when not following
 *         description: OK (e.g., if user was not following).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid User ID format or cannot unfollow self.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
followRouter.delete(
    '/:id',
    requireAuth,
    validateRequest({ params: userIdParamSchema }),
    followController.unfollowUser
);

export default followRouter;
