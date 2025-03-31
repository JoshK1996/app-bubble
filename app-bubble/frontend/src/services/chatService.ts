import { apiClient } from './apiClient';

// Types
export interface ChatRoom {
  id: string;
  name?: string;
  type: string;
  participants: Participant[];
  messages?: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface Participant {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  joinedAt: string;
  lastRead?: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  sender?: {
    id: string;
    name: string;
  };
  chatRoomId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessagesResponse {
  messages: Message[];
  nextCursor: string | null;
}

// API functions
/**
 * Get all chat rooms for the current user
 */
export const getUserChatRooms = async (): Promise<ChatRoom[]> => {
  const response = await apiClient.get('/chat/rooms');
  return response.data;
};

/**
 * Get a specific chat room by ID
 */
export const getChatRoomById = async (roomId: string): Promise<ChatRoom> => {
  const response = await apiClient.get(`/chat/rooms/${roomId}`);
  return response.data;
};

/**
 * Get messages for a chat room
 */
export const getChatRoomMessages = async (
  roomId: string,
  limit?: number,
  cursor?: string
): Promise<MessagesResponse> => {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (cursor) params.append('cursor', cursor);

  const response = await apiClient.get(`/chat/rooms/${roomId}/messages`, {
    params,
  });
  return response.data;
};

/**
 * Create a new message via REST API
 * (WebSocket is preferred for real-time messages)
 */
export const createMessage = async (roomId: string, content: string): Promise<Message> => {
  const response = await apiClient.post(`/chat/rooms/${roomId}/messages`, {
    content,
  });
  return response.data;
};

/**
 * Create a direct chat room with another user
 */
export const createDirectChatRoom = async (participantId: string): Promise<ChatRoom> => {
  const response = await apiClient.post('/chat/direct', {
    participantId,
  });
  return response.data;
};

/**
 * Create a group chat room
 */
export const createGroupChatRoom = async (name: string, participantIds: string[]): Promise<ChatRoom> => {
  const response = await apiClient.post('/chat/group', {
    name,
    participantIds,
  });
  return response.data;
}; 