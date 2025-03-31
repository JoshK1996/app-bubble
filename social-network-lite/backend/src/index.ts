/**
 * Social Network Lite - Main Server Entry Point
 * Initializes the Express server, database connections, and core middleware
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initializeDatabase, inMemoryStore } from './config/database';
import authRouter from './features/auth/auth.routes';
import postRouter from './features/posts/post.routes';
import followRouter from './features/follow/follow.routes';
import swaggerUi from 'swagger-ui-express';

// Load environment variables
dotenv.config();

// Set up port
const PORT = process.env.PORT || 5000;

// Initialize Express app
const app = express();

// Set up middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database
const startServer = async () => {
  try {
    await initializeDatabase();
    
    // Register routes
    app.use('/api/auth', authRouter);
    app.use('/api/posts', postRouter);
    app.use('/api/follow', followRouter);
    
    // Set up basic API documentation
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(undefined, {
      swaggerOptions: {
        url: '/api-docs.json',
      },
      explorer: true,
    }));
    
    // Add test and health endpoints
    app.get('/api/health', (req, res) => {
      res.status(200).json({ status: 'ok' });
    });
    
    // Add endpoint for testing in-memory database
    app.get('/api/test/setup', (req, res) => {
      // Create test users in memory
      const user1Id = "user1-test-id";
      const user2Id = "user2-test-id";
      
      const user1 = {
        id: user1Id,
        username: 'testuser1',
        password: 'hashed_password',
        fullName: 'Test User 1',
        email: 'test1@example.com',
        createdAt: new Date(),
      };
      
      const user2 = {
        id: user2Id,
        username: 'testuser2',
        password: 'hashed_password',
        fullName: 'Test User 2',
        email: 'test2@example.com',
        createdAt: new Date(),
      };
      
      inMemoryStore.users.set(user1Id, user1);
      inMemoryStore.users.set(user2Id, user2);
      
      res.status(200).json({ 
        message: 'Test users created',
        users: [
          { id: user1Id, username: user1.username },
          { id: user2Id, username: user2.username }
        ] 
      });
    });
    
    // Add endpoint to list in-memory users
    app.get('/api/test/users', (req, res) => {
      const users = Array.from(inMemoryStore.users.values()).map(user => ({
        id: user.id,
        username: user.username,
        fullName: user.fullName
      }));
      
      res.status(200).json(users);
    });
    
    // Add endpoint to list in-memory follows
    app.get('/api/test/follows', (req, res) => {
      const follows = Array.from(inMemoryStore.follows.values());
      res.status(200).json(follows);
    });
    
    // Start server
    try {
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`API Documentation available at /api-docs`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
    }
  } catch (error) {
    console.error('Failed to initialize the application:', error);
  }
};

startServer();
