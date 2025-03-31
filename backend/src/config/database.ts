/**
 * Database configuration module
 * 
 * This module handles the configuration and connection to different database types
 * (PostgreSQL via Prisma or MongoDB via Mongoose) based on environment variable settings.
 */

import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database type configuration from environment variable
export const DATABASE_TYPE = process.env.DATABASE_TYPE || 'postgres';

// Prisma client instance for PostgreSQL
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
});

/**
 * Initialize MongoDB connection using Mongoose
 * This function connects to MongoDB using the connection string from environment variables
 * 
 * @returns {Promise<typeof mongoose>} The mongoose connection instance
 */
export const connectMongoDB = async (): Promise<typeof mongoose> => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }
    
    // Connect to MongoDB
    const connection = await mongoose.connect(mongoURI);
    
    console.log('MongoDB connection established successfully');
    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

/**
 * Initialize database connection based on DATABASE_TYPE environment variable
 * This function will connect to either PostgreSQL (via Prisma) or MongoDB (via Mongoose)
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    if (DATABASE_TYPE === 'postgres') {
      // Prisma connects automatically on first query
      await prisma.$connect();
      console.log('PostgreSQL connection (Prisma) established successfully');
    } else if (DATABASE_TYPE === 'mongo') {
      await connectMongoDB();
    } else {
      throw new Error(`Unsupported database type: ${DATABASE_TYPE}. Use 'postgres' or 'mongo'.`);
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  }
};

/**
 * Close database connections
 * This function should be called when the application is shutting down
 */
export const closeDatabaseConnections = async (): Promise<void> => {
  if (DATABASE_TYPE === 'postgres') {
    await prisma.$disconnect();
  } else if (DATABASE_TYPE === 'mongo') {
    await mongoose.disconnect();
  }
}; 