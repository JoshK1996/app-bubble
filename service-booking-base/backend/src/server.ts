/**
 * Server Entry Point
 * Initializes the application and starts the server
 */
import app from './app';
import config from '@config/config';
import { logger } from '@config/logger';
import { initializeDatabase, closeDatabase } from '@config/database';

/**
 * Start Express server
 */
const startServer = async (): Promise<void> => {
  try {
    // Initialize database connection
    await initializeDatabase();

    // Start the server
    const server = app.listen(config.port, () => {
      logger.info(`⚡️ Server started in ${config.nodeEnv} mode`);
      logger.info(`🚀 API available at http://localhost:${config.port}${config.apiPrefix}`);
      logger.info(`📚 API docs available at http://localhost:${config.port}/api-docs`);
    });

    // Handle graceful shutdown
    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        logger.info('HTTP server closed');
        await closeDatabase();
        logger.info('Database connections closed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds if graceful shutdown fails
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer().catch((error) => {
  logger.error('Unhandled error during server startup:', error);
  process.exit(1);
}); 