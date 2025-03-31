/**
 * Social Network Lite - Main Server Entry Point
 * Initializes the Express server, database connections, and core middleware
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/database';
import { setupSwagger } from './config/swagger';
import authRouter from './features/auth/auth.routes';
import postRouter from './features/posts/post.routes';

// Load environment variables
dotenv.config();

// Initialize Express application
const app = express();
const port = process.env.PORT || 4000;

// Apply standard security and utility middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up API routes
app.use('/api/auth', authRouter);
app.use('/api/posts', postRouter);

// Set up API documentation with Swagger
setupSwagger(app);

// Initialize database connection
initializeDatabase()
  .then(() => {
    // Start server only after database is connected
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`API Documentation available at http://localhost:${port}/api-docs`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }); 