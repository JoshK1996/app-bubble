/**
 * E-commerce Platform API Entry Point
 */
import app from './app';
import config from '@config/config';
import { logger } from '@config/logger';
import { initializeDatabase, closeDatabase } from '@config/database';

/**
 * Initialize application and dependencies
 */
async function initializeApp() {
  try {
    // Initialize database connection
    await initializeDatabase();
    logger.info('Database connection established successfully');
    
    // Add other initialization steps here if needed
    // Example: initialize cache, external services, etc.
    
  } catch (error) {
    logger.error('Failed to initialize application dependencies', { error });
    process.exit(1);
  }
}

// Start server after initializing dependencies
const PORT = config.port || 4001;

// Initialize server variable
let server: ReturnType<typeof app.listen> | undefined;

// Self-invoking async function to allow await
(async () => {
  try {
    await initializeApp();
    
    server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      
      if (config.nodeEnv === 'development') {
        logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
        logger.info(`Health check endpoint available at http://localhost:${PORT}/health`);
      }
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
})();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', { error: err.message, stack: err.stack });
  
  // Gracefully shutdown
  if (server) {
    server.close(async () => {
      await closeDatabase();
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle SIGTERM signal (e.g., when running in containers)
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully');
  
  if (server) {
    server.close(async () => {
      await closeDatabase();
      logger.info('Process terminated');
    });
  }
});

export default server; 