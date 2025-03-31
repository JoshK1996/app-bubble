/**
 * Database Configuration and Connection Management
 * Supports PostgreSQL (via Prisma), MongoDB, and in-memory store
 */
import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import { logger } from './logger';
import config from './config';

// Initialize Prisma client for PostgreSQL
let prisma: PrismaClient | null = null;

/**
 * Connect to PostgreSQL database using Prisma
 */
const connectPostgres = async (): Promise<PrismaClient> => {
  try {
    if (!config.databaseUrl) {
      throw new Error('DATABASE_URL is not defined');
    }

    // Only initialize if not already initialized
    if (!prisma) {
      prisma = new PrismaClient({
        log: config.nodeEnv === 'development' 
          ? ['query', 'error', 'warn'] 
          : ['error'],
      });
    }
    
    // Test connection
    await prisma.$connect();
    logger.info('PostgreSQL connection established via Prisma');
    
    return prisma;
  } catch (error) {
    logger.error('PostgreSQL connection error:', { error });
    throw error;
  }
};

/**
 * Disconnect from PostgreSQL database
 */
const disconnectPostgres = async (): Promise<void> => {
  if (prisma) {
    await prisma.$disconnect();
    logger.info('Disconnected from PostgreSQL');
  }
};

/**
 * Connect to MongoDB
 */
const connectMongo = async (): Promise<typeof mongoose> => {
  try {
    if (!config.mongoUri) {
      throw new Error('MONGO_URI is not defined');
    }

    // Configure mongoose
    mongoose.set('strictQuery', true);
    
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri, {
      // Mongoose connection options (if needed)
    });
    
    logger.info('MongoDB connection established');
    
    return mongoose;
  } catch (error) {
    logger.error('MongoDB connection error:', { error });
    throw error;
  }
};

/**
 * Disconnect from MongoDB
 */
const disconnectMongo = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
};

/**
 * Set up in-memory store (for development and testing)
 */
const setupInMemoryStore = (): void => {
  logger.warn('Using in-memory store (data will not persist between restarts)');
  // Initialize in-memory data structures if needed
};

/**
 * Initialize database based on configuration
 */
export const initializeDatabase = async (): Promise<void> => {
  logger.info(`Initializing database with type: ${config.databaseType}`);
  
  try {
    switch (config.databaseType) {
      case 'postgres':
        await connectPostgres();
        break;
      case 'mongo':
        await connectMongo();
        break;
      case 'memory':
        setupInMemoryStore();
        break;
      default:
        throw new Error(`Unsupported database type: ${config.databaseType}`);
    }
  } catch (error) {
    logger.error(`Failed to initialize ${config.databaseType} database`, { error });
    
    if (config.nodeEnv === 'development' && config.databaseType !== 'memory') {
      logger.info('Falling back to in-memory store for development');
      setupInMemoryStore();
    } else {
      throw error; // Re-throw in production to ensure proper configuration
    }
  }
};

/**
 * Close database connections
 */
export const closeDatabase = async (): Promise<void> => {
  logger.info('Closing database connections');
  
  try {
    switch (config.databaseType) {
      case 'postgres':
        await disconnectPostgres();
        break;
      case 'mongo':
        await disconnectMongo();
        break;
      case 'memory':
        // Nothing to clean up for in-memory
        break;
      default:
        logger.warn(`No disconnect handler for database type: ${config.databaseType}`);
    }
  } catch (error) {
    logger.error('Error while closing database connections', { error });
    throw error;
  }
};

// Export database clients to be used in services
export const getDatabase = () => {
  switch (config.databaseType) {
    case 'postgres':
      return { prisma };
    case 'mongo':
      return { mongoose };
    case 'memory':
      return { inMemory: true };
    default:
      throw new Error(`Unsupported database type: ${config.databaseType}`);
  }
};

export default {
  initializeDatabase,
  closeDatabase,
  getDatabase,
}; 