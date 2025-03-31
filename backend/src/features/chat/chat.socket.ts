import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken } from '../../middleware/auth';
import { ChatEvents } from './chat.types';
import * as chatService from './chat.service';

/**
 * Setup Socket.IO server and configure chat event handlers
 */
export const setupSocketIO = (httpServer: HttpServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/socket.io',
  });

  // Socket.IO middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication error: Token required'));
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return next(new Error('Authentication error: Invalid token'));
      }

      // Add user data to socket
      socket.data.userId = decoded.id;
      socket.data.user = decoded;
      
      return next();
    } catch (error) {
      return next(new Error('Authentication error'));
    }
  });

  // Connection handler
  io.on('connection', (socket: Socket) => {
    const { userId } = socket.data;
    
    // Log and broadcast user online status
    console.log(`User connected: ${userId}`);
    
    // Broadcast user online status to all clients
    io.emit(ChatEvents.USER_ONLINE, { userId });
    
    // Handle joining a chat room
    socket.on(ChatEvents.JOIN_ROOM, async (roomId: string) => {
      try {
        if (!roomId) return;
        
        // Verify user is allowed to join this room
        const chatRoom = await chatService.getChatRoomById(roomId, userId);
        if (!chatRoom) {
          socket.emit(ChatEvents.ERROR, { message: 'Cannot join room: Not authorized' });
          return;
        }
        
        // Join the socket room
        socket.join(roomId);
        console.log(`User ${userId} joined room: ${roomId}`);
        
        // Notify room that user has joined
        socket.to(roomId).emit(ChatEvents.USER_ONLINE, { userId, roomId });
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit(ChatEvents.ERROR, { message: 'Failed to join room' });
      }
    });
    
    // Handle leaving a chat room
    socket.on(ChatEvents.LEAVE_ROOM, (roomId: string) => {
      if (!roomId) return;
      
      socket.leave(roomId);
      console.log(`User ${userId} left room: ${roomId}`);
      
      // Notify room that user has left
      socket.to(roomId).emit(ChatEvents.USER_OFFLINE, { userId, roomId });
    });
    
    // Handle new message
    socket.on(ChatEvents.NEW_MESSAGE, async ({ roomId, content }: { roomId: string; content: string }) => {
      try {
        if (!roomId || !content) {
          socket.emit(ChatEvents.ERROR, { message: 'Room ID and content are required' });
          return;
        }
        
        // Create message in database
        const message = await chatService.createMessage(roomId, userId, content);
        
        // Broadcast to all clients in the room
        io.to(roomId).emit(ChatEvents.NEW_MESSAGE, message);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit(ChatEvents.ERROR, { message: 'Failed to send message' });
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
      
      // Broadcast to all clients
      io.emit(ChatEvents.USER_OFFLINE, { userId });
    });
  });
  
  return io;
}; 