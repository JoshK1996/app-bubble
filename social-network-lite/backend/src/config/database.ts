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
  MEMORY = 'memory',
}

// Extract database configuration from environment variables
const {
  DATABASE_TYPE = DatabaseType.MEMORY, // Change default to MEMORY for testing
  DATABASE_URL,
  MONGODB_URI,
  NODE_ENV,
  TEST_DATABASE_URL,
  TEST_MONGODB_URI,
} = process.env;

// Determine if we're in test environment
const isTestEnvironment = NODE_ENV === 'test';

// Select the appropriate connection string based on environment
const postgresConnectionString = isTestEnvironment
  ? TEST_DATABASE_URL
  : DATABASE_URL;
const mongoConnectionString = isTestEnvironment
  ? TEST_MONGODB_URI
  : MONGODB_URI;

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

// In-memory data store for demo/development when no database is available
export const inMemoryStore = {
  users: new Map(),
  posts: new Map(),
  follows: new Map(),
};

/**
 * Connects to MongoDB using Mongoose
 * @returns A promise that resolves when connected
 */
export const connectMongo = async (): Promise<void> => {
  try {
    if (!mongoConnectionString) {
      console.warn(
        'MongoDB connection string is not defined in environment variables, using in-memory store',
      );
      process.env.DATABASE_TYPE = DatabaseType.MEMORY;
      return;
    }

    await mongoose.connect(mongoConnectionString);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.warn('Falling back to in-memory store for development');
    process.env.DATABASE_TYPE = DatabaseType.MEMORY;
  }
};

/**
 * Get the currently selected database type
 * @returns The current database type (postgres, mongo, or memory)
 */
export const getDatabaseType = (): DatabaseType => {
  const dbType = process.env.DATABASE_TYPE?.toLowerCase() || DatabaseType.MEMORY;

  if (
    dbType !== DatabaseType.POSTGRES && 
    dbType !== DatabaseType.MONGO &&
    dbType !== DatabaseType.MEMORY
  ) {
    console.warn(
      `Unsupported database type: ${dbType}. Falling back to in-memory store.`,
    );
    return DatabaseType.MEMORY;
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
  } else if (dbType === DatabaseType.POSTGRES) {
    // For Prisma, we don't need to explicitly connect as it happens on first query
    // But we do need to handle any initialization errors
    try {
      // Run a simple query to test the connection
      await prisma.$queryRaw`SELECT 1`;
      console.log('PostgreSQL connected successfully');
    } catch (error) {
      console.error('PostgreSQL connection error:', error);
      console.warn('Falling back to in-memory store for development');
      process.env.DATABASE_TYPE = DatabaseType.MEMORY;
    }
  } else {
    console.log('Using in-memory database for development');
  }
};
