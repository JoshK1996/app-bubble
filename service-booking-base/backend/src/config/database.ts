/**
 * Database Configuration
 * Handles database connections for both MongoDB and PostgreSQL based on environment configuration
 */
import mongoose from 'mongoose';
import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

// Extend the global namespace to include our database clients
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Initialize Prisma client with a singleton pattern to prevent multiple instances in development
export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

/**
 * Initialize database connection based on DATABASE_TYPE environment variable
 */
export const initializeDatabase = async (): Promise<void> => {
  const databaseType = process.env.DATABASE_TYPE || 'postgres';

  try {
    if (databaseType === 'mongo') {
      await connectMongo();
      logger.info('MongoDB connection established');
    } else {
      // For postgres, Prisma automatically connects on first query
      await testPrismaConnection();
      logger.info('PostgreSQL connection established via Prisma');
    }
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
};

/**
 * Connect to MongoDB
 */
const connectMongo = async (): Promise<typeof mongoose> => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/service_booking';

  // Set mongoose connection options
  mongoose.set('strictQuery', true);

  try {
    return await mongoose.connect(mongoUri);
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    throw error;
  }
};

/**
 * Test Prisma connection to PostgreSQL
 */
const testPrismaConnection = async (): Promise<void> => {
  try {
    // Execute a simple query to test the connection
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    logger.error('Prisma client connection error:', error);
    throw error;
  }
};

/**
 * Close database connections
 */
export const closeDatabase = async (): Promise<void> => {
  try {
    const databaseType = process.env.DATABASE_TYPE || 'postgres';
    
    if (databaseType === 'mongo' && mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed');
    }
    
    await prisma.$disconnect();
    logger.info('Prisma client disconnected');
  } catch (error) {
    logger.error('Error closing database connections:', error);
    throw error;
  }
}; 