/**
 * Database configuration and connection setup
 * Handles dynamic selection between PostgreSQL (Prisma) and MongoDB (Mongoose)
 */
import mongoose from 'mongoose';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define database type constants
export enum DatabaseType {
  POSTGRES = 'postgres',
  MONGO = 'mongo',
}

// Extract database configuration from environment variables
const {
  DATABASE_TYPE = DatabaseType.POSTGRES,
  DATABASE_URL,
  MONGODB_URI,
  NODE_ENV,
  TEST_DATABASE_URL,
  TEST_MONGODB_URI,
} = process.env;

// Determine if we're in test environment
const isTestEnvironment = NODE_ENV === 'test';

// Select the appropriate connection string based on environment
const postgresConnectionString = isTestEnvironment ? TEST_DATABASE_URL : DATABASE_URL;
const mongoConnectionString = isTestEnvironment ? TEST_MONGODB_URI : MONGODB_URI;

/**
 * Initialize and provide the Prisma client instance for PostgreSQL
 */
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: postgresConnectionString,
    },
  },
});

/**
 * Connects to MongoDB using Mongoose
 * @returns A promise that resolves when connected
 */
export const connectMongo = async (): Promise<void> => {
  try {
    if (!mongoConnectionString) {
      throw new Error('MongoDB connection string is not defined in environment variables');
    }
    
    await mongoose.connect(mongoConnectionString);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

/**
 * Get the currently selected database type
 * @returns The current database type (postgres or mongo)
 */
export const getDatabaseType = (): DatabaseType => {
  const dbType = DATABASE_TYPE.toLowerCase();
  
  if (dbType !== DatabaseType.POSTGRES && dbType !== DatabaseType.MONGO) {
    console.warn(`Unsupported database type: ${dbType}. Falling back to PostgreSQL.`);
    return DatabaseType.POSTGRES;
  }
  
  return dbType as DatabaseType;
};

/**
 * Initializes the database connection based on the configured database type
 */
export const initializeDatabase = async (): Promise<void> => {
  const dbType = getDatabaseType();
  
  if (dbType === DatabaseType.MONGO) {
    await connectMongo();
  } else {
    // For Prisma, we don't need to explicitly connect as it happens on first query
    // But we do need to handle any initialization errors
    try {
      // Run a simple query to test the connection
      await prisma.$queryRaw`SELECT 1`;
      console.log('PostgreSQL connected successfully');
    } catch (error) {
      console.error('PostgreSQL connection error:', error);
      process.exit(1);
    }
  }
}; 