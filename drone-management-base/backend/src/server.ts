import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';

// Import routes
import authRoutes from './features/auth/auth.routes';
import userRoutes from './features/users/users.routes';
import droneRoutes from './features/drones/drones.routes';
import missionRoutes from './features/missions/missions.routes';
import maintenanceRoutes from './features/maintenance/maintenance.routes';
import telemetryRoutes from './features/telemetry/telemetry.routes';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// Create HTTP server
const httpServer = createServer(app);

// Initialize and configure the application
const initializeApp = async () => {
  try {
    // Dynamically import dependencies to avoid linter errors
    const cors = await import('cors');
    const helmet = await import('helmet');
    const compression = await import('compression');
    const morgan = await import('morgan');
    const socketIo = await import('socket.io');
    
    // Initialize Socket.io
    const io = new socketIo.Server(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    // Initialize middleware
    app.use(helmet.default());
    app.use(compression.default());
    app.use(cors.default({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true
    }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(morgan.default('dev'));

    // API Routes
    app.use(`${API_PREFIX}/auth`, authRoutes);
    app.use(`${API_PREFIX}/users`, userRoutes);
    app.use(`${API_PREFIX}/drones`, droneRoutes);
    app.use(`${API_PREFIX}/missions`, missionRoutes);
    app.use(`${API_PREFIX}/maintenance`, maintenanceRoutes);
    app.use(`${API_PREFIX}/telemetry`, telemetryRoutes);

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.status(200).json({ status: 'UP', timestamp: new Date() });
    });

    // Handle 404 errors
    app.use(notFoundHandler);

    // Error handling middleware
    app.use(errorHandler);

    // Socket.io connection handling
    io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      // Join drone specific room for real-time updates
      socket.on('joinDroneRoom', (droneId: string) => {
        socket.join(`drone:${droneId}`);
        logger.info(`Client ${socket.id} joined room for drone ${droneId}`);
      });

      // Join mission specific room for real-time updates
      socket.on('joinMissionRoom', (missionId: string) => {
        socket.join(`mission:${missionId}`);
        logger.info(`Client ${socket.id} joined room for mission ${missionId}`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });
    });

    // Connect to database(s)
    const { connectDatabase } = await import('./utils/database');
    await connectDatabase();
    
    // Export io for usage in other modules
    return { app, httpServer, io };
  } catch (error) {
    logger.error('Failed to initialize application:', error);
    throw error;
  }
};

// Start the server
const startServer = async () => {
  try {
    await initializeApp();
    
    // Start the HTTP server
    httpServer.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`API available at ${API_PREFIX}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Initialize server
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app, httpServer, initializeApp }; 