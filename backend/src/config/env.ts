/**
 * Environment Configuration Module
 * 
 * This module centralizes environment variable access and provides
 * validation to ensure required variables are present.
 */

import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Environment variable configuration object
 * Contains all environment variables used throughout the application
 */
export const env = {
  // Node environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Server configuration
  PORT: parseInt(process.env.PORT || '4000', 10),
  
  // Database configuration
  DATABASE_TYPE: process.env.DATABASE_TYPE || 'postgres',
  POSTGRES_URL: process.env.POSTGRES_URL || 'postgresql://postgres:postgres@localhost:5432/taskmanagement',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanagement',
  
  // Test database configurations
  TEST_POSTGRES_URL: process.env.TEST_POSTGRES_URL || 'postgresql://postgres:postgres@localhost:5432/taskmanagement_test',
  TEST_MONGODB_URI: process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/taskmanagement_test',
  
  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET || 'development_secret_key_change_in_production',
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '1d',
  
  // CORS configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
};

/**
 * Validates that all required environment variables are present
 * 
 * @throws {Error} If any required environment variables are missing
 */
export const validateEnv = (): void => {
  // In production, we should validate that critical environment variables are set properly
  if (env.NODE_ENV === 'production') {
    const requiredProductionVars = [
      'PORT',
      'JWT_SECRET',
      env.DATABASE_TYPE === 'postgres' ? 'POSTGRES_URL' : 'MONGODB_URI',
    ];
    
    const missingVars = requiredProductionVars.filter(
      (varName) => !process.env[varName]
    );
    
    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables in production: ${missingVars.join(', ')}`
      );
    }
    
    // Validate JWT_SECRET is not the default value in production
    if (env.JWT_SECRET === 'development_secret_key_change_in_production') {
      throw new Error('Using default JWT_SECRET in production is not allowed. Please set a secure JWT_SECRET.');
    }
  }
  
  // Validate database configuration
  if (env.DATABASE_TYPE !== 'postgres' && env.DATABASE_TYPE !== 'mongo') {
    throw new Error(`Invalid DATABASE_TYPE: ${env.DATABASE_TYPE}. Must be 'postgres' or 'mongo'.`);
  }
}; 