/**
 * Types for the chat module
 */

export interface CreateChatRoomRequest {
  userId: string;
  participantId?: string; // For direct chats
  participantIds?: string[]; // For group chats
  name?: string; // Required for group chats
}

export interface GetChatRoomMessagesRequest {
  roomId: string;
  userId: string;
  limit?: number;
  cursor?: string; // For pagination
}

// DTOs for API responses
export interface ChatRoomDTO {
  id: string;
  name?: string;
  type: string;
  participants: ParticipantDTO[];
  latestMessage?: MessageDTO;
  createdAt: Date;
  updatedAt: Date;
}

export interface ParticipantDTO {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  joinedAt: Date;
  lastRead?: Date;
}

export interface MessageDTO {
  id: string;
  content: string;
  senderId: string;
  sender?: {
    id: string;
    name: string;
  };
  chatRoomId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatRoomMessagesResponse {
  messages: MessageDTO[];
  nextCursor: string | null;
}

// Socket.io events
export enum ChatEvents {
  JOIN_ROOM = 'join_room',
  LEAVE_ROOM = 'leave_room',
  NEW_MESSAGE = 'new_message',
  USER_ONLINE = 'user_online',
  USER_OFFLINE = 'user_offline',
  USER_TYPING = 'user_typing',
  USER_STOPPED_TYPING = 'user_stopped_typing',
} 