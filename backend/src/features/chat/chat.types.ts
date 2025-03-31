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
  cursor?: string;
}

export interface ChatRoomDTO {
  id: string;
  name: string | null;
  type: 'direct' | 'group';
  createdAt: Date;
  updatedAt: Date;
  participants: {
    id: string;
    userId: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatar: string | null;
    };
    isAdmin: boolean;
    joinedAt: Date;
  }[];
  messages: {
    id: string;
    content: string;
    createdAt: Date;
    sender: {
      id: string;
      name: string;
      avatar: string | null;
    };
  }[];
  lastMessage?: {
    id: string;
    content: string;
    createdAt: Date;
    senderId: string;
    chatRoomId: string;
  };
}

export interface ChatRoomMessagesResponse {
  messages: any[];
  nextCursor: string | null;
}

// Socket.io events
export enum ChatEvents {
  JOIN_ROOM = 'join_room',
  LEAVE_ROOM = 'leave_room',
  NEW_MESSAGE = 'new_message',
  USER_TYPING = 'user_typing',
  USER_STOPPED_TYPING = 'user_stopped_typing',
  USER_ONLINE = 'user_online',
  USER_OFFLINE = 'user_offline',
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  ERROR = 'error'
} 