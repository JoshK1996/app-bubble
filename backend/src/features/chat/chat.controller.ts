import { Request, Response } from 'express';
import * as chatService from './chat.service';

/**
 * Get all chat rooms for the authenticated user
 */
export const getUserChatRooms = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const chatRooms = await chatService.getUserChatRooms(userId);
    return res.status(200).json(chatRooms);
  } catch (error) {
    console.error('Error getting user chat rooms:', error);
    return res.status(500).json({ message: 'Failed to get chat rooms' });
  }
};

/**
 * Get a specific chat room by ID
 */
export const getChatRoomById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { roomId } = req.params;
    if (!roomId) {
      return res.status(400).json({ message: 'Room ID is required' });
    }

    const chatRoom = await chatService.getChatRoomById(roomId, userId);
    return res.status(200).json(chatRoom);
  } catch (error) {
    console.error('Error getting chat room:', error);
    if (error instanceof Error && error.message === 'User is not a participant in this chat room') {
      return res.status(403).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Failed to get chat room' });
  }
};

/**
 * Get messages for a chat room
 */
export const getChatRoomMessages = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { roomId } = req.params;
    const { limit, cursor } = req.query;

    const messages = await chatService.getChatRoomMessages({
      roomId,
      userId,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      cursor: cursor as string,
    });

    return res.status(200).json(messages);
  } catch (error) {
    console.error('Error getting chat room messages:', error);
    if (error instanceof Error && error.message === 'User is not a participant in this chat room') {
      return res.status(403).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Failed to get chat room messages' });
  }
};

/**
 * Create a new message in a chat room
 * (WebSocket is preferred for real-time messages)
 */
export const createMessage = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { roomId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const message = await chatService.createMessage(roomId, userId, content);
    return res.status(201).json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    if (error instanceof Error && error.message === 'User is not a participant in this chat room') {
      return res.status(403).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Failed to create message' });
  }
};

/**
 * Create a direct chat room with another user
 */
export const createDirectChatRoom = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json({ message: 'Participant ID is required' });
    }

    // Don't allow creating a chat room with yourself
    if (participantId === userId) {
      return res.status(400).json({ message: 'Cannot create a chat room with yourself' });
    }

    const chatRoom = await chatService.createDirectChatRoom({
      userId,
      participantId,
    });

    return res.status(201).json(chatRoom);
  } catch (error) {
    console.error('Error creating direct chat room:', error);
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Failed to create direct chat room' });
  }
};

/**
 * Create a group chat room
 */
export const createGroupChatRoom = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { name, participantIds } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({ message: 'At least one participant is required' });
    }

    // Filter out invalid IDs and duplicates
    const uniqueParticipantIds = [...new Set(participantIds.filter(id => {
      return typeof id === 'string' && id.trim() !== '';
    }))];

    const chatRoom = await chatService.createGroupChatRoom({
      userId,
      name,
      participantIds: uniqueParticipantIds,
    });

    return res.status(201).json(chatRoom);
  } catch (error) {
    console.error('Error creating group chat room:', error);
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Failed to create group chat room' });
  }
}; 