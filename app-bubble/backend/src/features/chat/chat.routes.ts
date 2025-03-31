import { Router } from 'express';
import * as chatController from './chat.controller';
import { authenticateJWT } from '../auth/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/chat/rooms:
 *   get:
 *     summary: Get all chat rooms for the authenticated user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of chat rooms
 *       401:
 *         description: Unauthorized
 */
router.get('/rooms', authenticateJWT, chatController.getUserChatRooms);

/**
 * @swagger
 * /api/chat/rooms/{roomId}:
 *   get:
 *     summary: Get a specific chat room by ID
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat room details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user not a participant
 *       500:
 *         description: Server error
 */
router.get('/rooms/:roomId', authenticateJWT, chatController.getChatRoomById);

/**
 * @swagger
 * /api/chat/rooms/{roomId}/messages:
 *   get:
 *     summary: Get messages for a chat room
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of messages with pagination cursor
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user not a participant
 *       500:
 *         description: Server error
 */
router.get('/rooms/:roomId/messages', authenticateJWT, chatController.getChatRoomMessages);

/**
 * @swagger
 * /api/chat/rooms/{roomId}/messages:
 *   post:
 *     summary: Create a new message in a chat room
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
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
 *       201:
 *         description: Message created
 *       400:
 *         description: Bad request - missing content
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user not a participant
 *       500:
 *         description: Server error
 */
router.post('/rooms/:roomId/messages', authenticateJWT, chatController.createMessage);

/**
 * @swagger
 * /api/chat/direct:
 *   post:
 *     summary: Create a direct chat room with another user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - participantId
 *             properties:
 *               participantId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Direct chat room created or existing one returned
 *       400:
 *         description: Bad request - missing participant ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Participant user not found
 *       500:
 *         description: Server error
 */
router.post('/direct', authenticateJWT, chatController.createDirectChatRoom);

/**
 * @swagger
 * /api/chat/group:
 *   post:
 *     summary: Create a group chat room
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - participantIds
 *             properties:
 *               name:
 *                 type: string
 *               participantIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Group chat room created
 *       400:
 *         description: Bad request - missing name or participants
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: One or more participants not found
 *       500:
 *         description: Server error
 */
router.post('/group', authenticateJWT, chatController.createGroupChatRoom);

export default router; 