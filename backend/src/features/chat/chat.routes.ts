import express from 'express';
import * as chatController from './chat.controller';
import { authenticateJWT } from '../../middleware/auth';

const router = express.Router();

/**
 * @route GET /api/chat/rooms
 * @desc Get all chat rooms for the authenticated user
 * @access Private
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
 * @route GET /api/chat/rooms/:roomId
 * @desc Get a specific chat room by ID
 * @access Private
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
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the chat room
 *     responses:
 *       200:
 *         description: Chat room details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user is not a participant
 *       404:
 *         description: Chat room not found
 */
router.get('/rooms/:roomId', authenticateJWT, chatController.getChatRoomById);

/**
 * @route GET /api/chat/rooms/:roomId/messages
 * @desc Get messages for a chat room
 * @access Private
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
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the chat room
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of messages to return (default 50)
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: Cursor for pagination
 *     responses:
 *       200:
 *         description: Chat messages
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user is not a participant
 */
router.get('/rooms/:roomId/messages', authenticateJWT, chatController.getChatRoomMessages);

/**
 * @route POST /api/chat/rooms/:roomId/messages
 * @desc Create a new message in a chat room
 * @access Private
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
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the chat room
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
 *                 description: Message content
 *     responses:
 *       201:
 *         description: Message created
 *       400:
 *         description: Bad request - content missing
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user is not a participant
 */
router.post('/rooms/:roomId/messages', authenticateJWT, chatController.createMessage);

/**
 * @route POST /api/chat/direct
 * @desc Create a direct chat room with another user
 * @access Private
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
 *                 description: ID of the user to chat with
 *     responses:
 *       201:
 *         description: Direct chat room created or existing one returned
 *       400:
 *         description: Bad request - invalid participantId
 *       401:
 *         description: Unauthorized
 */
router.post('/direct', authenticateJWT, chatController.createDirectChatRoom);

/**
 * @route POST /api/chat/group
 * @desc Create a group chat room
 * @access Private
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
 *                 description: Name of the group
 *               participantIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user IDs to add to the group
 *     responses:
 *       201:
 *         description: Group chat room created
 *       400:
 *         description: Bad request - missing required fields
 *       401:
 *         description: Unauthorized
 */
router.post('/group', authenticateJWT, chatController.createGroupChatRoom);

export default router; 