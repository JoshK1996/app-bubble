/**
 * Social Network Lite - Main Server Entry Point
 * Initializes the Express server, database connections, and core middleware
 */
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan'; // Import morgan for request logging
import { StatusCodes } from 'http-status-codes';

import config from './config/config'; // Import validated config
import { logger } from './config/logger'; // Import logger
import { initializeDatabase } from './config/database';
import { setupSwagger } from './config/swagger';
import { errorHandler } from './middleware/errorHandler'; // Import global error handler
import { AppError } from './utils/AppError'; // Import custom error class

// Import feature routers
// import categoryRouter from './features/categories/category.routes'; // Removed E-commerce route
// Import other feature routers here (e.g., posts, users, follow)
import postRoutes from './features/posts/post.routes';
import authRoutes from './features/auth/auth.routes'; // Assuming auth routes exist
import followRoutes from './features/follow/follow.routes'; // Assuming follow routes exist
import userRoutes from './features/users/user.routes'; // Assuming user routes exist

// Initialize Express application
const app = express();
const port = config.port; // Use port from validated config

// --- Core Middleware --- 

// Security headers
app.use(helmet());

// Enable CORS - configure origins properly in production
// Example: app.use(cors({ origin: config.corsOrigin }));
app.use(cors());

// Request body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logging (use 'combined' format in prod, 'dev' in development)
const morganFormat = config.nodeEnv === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, { stream: { write: (message) => logger.http(message.trim()) } }));

// Set up API documentation with Swagger
setupSwagger(app);

// --- Feature API Routes --- 
logger.info('Mounting API routes...');
app.use('/api/posts', postRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/users', userRoutes);
// app.use('/api/categories', categoryRouter); // Removed E-commerce route
logger.info('API routes mounted.');

// --- Error Handling Middleware --- 

// Handle 404 Not Found errors for any routes not matched above
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Not Found - ${req.method} ${req.originalUrl}`, StatusCodes.NOT_FOUND));
});

// Global error handler - MUST be the last piece of middleware added
app.use(errorHandler);

// --- Server Startup --- 

const startServer = async () => {
  try {
    logger.info('Initializing database connection...');
    await initializeDatabase(); // Ensure DB connection before starting server
    logger.info('Database connection established successfully.');

    // Start the Express server
    app.listen(port, () => {
      logger.info(`Server running on port ${port} in ${config.nodeEnv} mode`);
      // Log API docs URL for convenience
      if (config.nodeEnv !== 'production') {
        logger.info(`API Documentation available at http://localhost:${port}/api-docs`);
      }
    });
  } catch (error) {
    logger.error('Failed to initialize application:', { error });
    process.exit(1);
  }
};

startServer(); 