import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import { logger } from './logger';

// Initialize Prisma client
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

/**
 * Connect to MongoDB database
 */
const connectMongo = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/drone_management';
    
    await mongoose.connect(mongoUri, {
      // Add mongoose options here if needed
    });
    
    logger.info('Connected to MongoDB database');
    
    // Handle MongoDB connection events
    mongoose.connection.on('error', (error) => {
      logger.error(`MongoDB connection error: ${error}`);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
    
    // Handle process termination and close database connection properly
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed due to app termination');
      process.exit(0);
    });
    
  } catch (error) {
    logger.error(`Failed to connect to MongoDB: ${error}`);
    throw error;
  }
};

/**
 * Connect to PostgreSQL database via Prisma
 */
const connectPostgres = async (): Promise<void> => {
  try {
    // Connect to the database
    await prisma.$connect();
    logger.info('Connected to PostgreSQL database via Prisma');
    
    // Handle process termination and close database connection properly
    process.on('SIGINT', async () => {
      await prisma.$disconnect();
      logger.info('PostgreSQL connection closed due to app termination');
      process.exit(0);
    });
    
  } catch (error) {
    logger.error(`Failed to connect to PostgreSQL via Prisma: ${error}`);
    throw error;
  }
};

/**
 * Connect to databases based on configuration
 */
export const connectDatabase = async (): Promise<void> => {
  const databaseType = process.env.DATABASE_TYPE || 'postgres';
  
  try {
    // Always connect to PostgreSQL for relational data
    await connectPostgres();
    
    // Connect to MongoDB for high-frequency telemetry data
    await connectMongo();
    
    logger.info(`Database connections established successfully (Type: ${databaseType})`);
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw new Error('Failed to connect to databases');
  }
};

/**
 * Disconnect from all databases
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    // Disconnect Prisma
    await prisma.$disconnect();
    
    // Disconnect MongoDB
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    
    logger.info('All database connections closed');
  } catch (error) {
    logger.error('Error disconnecting from databases:', error);
    throw error;
  }
};

export default {
  prisma,
  connectDatabase,
  disconnectDatabase,
}; 