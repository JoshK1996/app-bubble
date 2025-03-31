/**
 * Application Entry Point
 * 
 * This is the main entry point for the Task Management backend application.
 * It sets up the Express server, configures middleware, initializes database connections,
 * and registers API routes.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import http from 'http';

import { env, validateEnv } from './config/env';
import { initializeDatabase, closeDatabaseConnections } from './config/database';

// Import routes
import authRoutes from './features/auth/auth.routes';
import userRoutes from './features/users/user.routes';
import boardRoutes from './features/boards/board.routes';
import columnRoutes from './features/columns/column.routes';
import taskRoutes from './features/tasks/task.routes';
import chatRoutes from './features/chat/chat.routes';

// Import Socket.IO setup
import { setupSocketIO } from './features/chat/chat.socket';

// Validate environment variables
validateEnv();

// Create Express application
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = setupSocketIO(server);

// Configure middleware
app.use(helmet()); // Security headers
app.use(cors({ origin: env.CORS_ORIGIN })); // CORS configuration
app.use(express.json()); // JSON request body parsing
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined')); // Request logging

// Swagger API documentation configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Management API',
      version: '1.0.0',
      description: 'API for Task Management "Bubble" from APP BUBBLE',
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/features/**/*.routes.ts', './src/features/**/*.controller.ts'], // Path to API route files with JSDoc comments
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Register API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/columns', columnRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/chat', chatRoutes);

// API Documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Error handling middleware (must be after all routes)
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    error: {
      message: 'Internal Server Error',
      // Only include error details in development
      ...(env.NODE_ENV === 'development' && { details: err.message, stack: err.stack }),
    },
  });
});

// Not found handler (must be after all routes)
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({
    error: {
      message: `Not Found - ${req.method} ${req.originalUrl}`,
    },
  });
});

// Initialize database and start server
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await initializeDatabase();
    
    // Start HTTP server (not Express directly)
    server.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      console.log(`API Documentation available at http://localhost:${env.PORT}/api-docs`);
      console.log(`Socket.IO server is active for real-time chat`);
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Shutting down server...');
      await closeDatabaseConnections();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      console.log('Shutting down server...');
      await closeDatabaseConnections();
      process.exit(0);
    });
  } catch (error) {
    console.error('Server initialization failed:', error);
    process.exit(1);
  }
};

// Start the server
startServer(); 