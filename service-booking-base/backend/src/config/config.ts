/**
 * Application Configuration
 * Centralizes access to environment variables with defaults
 */
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Application configuration object
 */
const config = {
  // Node environment
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  // Server configuration
  port: parseInt(process.env.PORT || '5000', 10),
  apiPrefix: process.env.API_PREFIX || '/api/v1',

  // Database configuration
  databaseType: process.env.DATABASE_TYPE || 'postgres',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/service_booking',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/service_booking',

  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // CORS configuration
  corsOrigin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [],

  // Test database configuration
  testDatabaseUrl: process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/service_booking_test',
  testMongoUri: process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/service_booking_test',
};

export default config; 