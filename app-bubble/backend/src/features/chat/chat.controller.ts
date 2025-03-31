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
    const { roomId } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
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
    const { roomId } = req.params;
    const { limit, cursor } = req.query;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const messages = await chatService.getChatRoomMessages({
      roomId,
      userId,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      cursor: cursor as string | undefined,
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
 * Create a new message via REST API
 * (WebSocket is preferred for real-time messages)
 */
export const createMessage = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!content || typeof content !== 'string' || content.trim() === '') {
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
    const { participantId } = req.body;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!participantId) {
      return res.status(400).json({ message: 'Participant ID is required' });
    }

    // Don't allow creating a chat room with yourself
    if (userId === participantId) {
      return res.status(400).json({ message: 'Cannot create a chat room with yourself' });
    }

    const chatRoom = await chatService.createDirectChatRoom({
      userId,
      participantId,
    });

    return res.status(201).json(chatRoom);
  } catch (error) {
    console.error('Error creating direct chat room:', error);
    if (error instanceof Error && error.message === 'Participant user not found') {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Failed to create direct chat room' });
  }
};

/**
 * Create a group chat room
 */
export const createGroupChatRoom = async (req: Request, res: Response) => {
  try {
    const { name, participantIds } = req.body;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ message: 'Group name is required' });
    }

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({ message: 'At least one participant is required' });
    }

    // Don't allow duplicate participants
    const uniqueParticipantIds = [...new Set(participantIds)];

    // Don't include the creator in the participants list
    const filteredParticipantIds = uniqueParticipantIds.filter(id => id !== userId);

    if (filteredParticipantIds.length === 0) {
      return res.status(400).json({ message: 'At least one other participant is required' });
    }

    const chatRoom = await chatService.createGroupChatRoom({
      userId,
      name,
      participantIds: filteredParticipantIds,
    });

    return res.status(201).json(chatRoom);
  } catch (error) {
    console.error('Error creating group chat room:', error);
    if (error instanceof Error && error.message === 'One or more participant users not found') {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Failed to create group chat room' });
  }
}; 