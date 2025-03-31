import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { ChatEvents } from './chat.types';
import * as chatService from './chat.service';

// Track online users
const onlineUsers = new Map<string, string>(); // userId -> socketId

export const setupSocketIO = (httpServer: HttpServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Socket.IO middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as jwt.JwtPayload;
      if (!decoded || !decoded.id) {
        return next(new Error('Authentication error: Invalid token'));
      }
      
      // Attach user data to socket
      socket.data.user = {
        id: decoded.id,
      };
      
      next();
    } catch (error) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.user?.id;
    if (!userId) {
      socket.disconnect();
      return;
    }

    console.log(`User connected: ${userId}`);
    
    // Store user's socket ID
    onlineUsers.set(userId, socket.id);
    
    // Broadcast to others that this user is online
    io.emit(ChatEvents.USER_ONLINE, { userId });

    // Handle joining a chat room
    socket.on(ChatEvents.JOIN_ROOM, async (roomId: string) => {
      try {
        // Verify user has access to this room
        const chatRoom = await chatService.getChatRoomById(roomId, userId);
        if (!chatRoom) {
          socket.emit('error', { message: 'Cannot join room: Access denied' });
          return;
        }

        // Join the room
        socket.join(roomId);
        console.log(`User ${userId} joined room ${roomId}`);

        // Notify others in the room
        socket.to(roomId).emit('user_joined', { userId });
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Handle leaving a chat room
    socket.on(ChatEvents.LEAVE_ROOM, (roomId: string) => {
      socket.leave(roomId);
      console.log(`User ${userId} left room ${roomId}`);
      
      // Notify others in the room
      socket.to(roomId).emit('user_left', { userId });
    });

    // Handle new message
    socket.on(ChatEvents.NEW_MESSAGE, async ({ roomId, content }: { roomId: string; content: string }) => {
      try {
        if (!content || typeof content !== 'string' || content.trim() === '') {
          socket.emit('error', { message: 'Message content is required' });
          return;
        }

        // Create the message in the database
        const message = await chatService.createMessage(roomId, userId, content);

        // Broadcast to everyone in the room including sender
        io.to(roomId).emit(ChatEvents.NEW_MESSAGE, message);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle user typing
    socket.on(ChatEvents.USER_TYPING, ({ roomId }: { roomId: string }) => {
      socket.to(roomId).emit(ChatEvents.USER_TYPING, { userId });
    });

    // Handle user stopped typing
    socket.on(ChatEvents.USER_STOPPED_TYPING, ({ roomId }: { roomId: string }) => {
      socket.to(roomId).emit(ChatEvents.USER_STOPPED_TYPING, { userId });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
      
      // Remove user from online users
      onlineUsers.delete(userId);
      
      // Broadcast to others that this user is offline
      io.emit(ChatEvents.USER_OFFLINE, { userId });
    });
  });

  return io;
}; 