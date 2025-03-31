/**
 * Application Configuration
 * Loads environment variables and provides type-safe access.
 */
import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables from .env file
// Determine the path to the .env file based on the current environment
// This assumes the script is run from the 'backend' directory or its subdirectories
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

// Define the schema for environment variables using Zod
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().positive().default(4000),
  DATABASE_TYPE: z.enum(['postgres', 'mongo', 'memory']).default('memory'), // Allow 'memory' for testing/dev
  DATABASE_URL: z.string().url().optional(), // Required for postgres
  MONGO_URI: z.string().url().optional(), // Required for mongo
  JWT_SECRET: z.string().min(1).default('your-default-jwt-secret-key-32-chars'), // Default for dev, MUST be overridden in prod
  JWT_EXPIRES_IN: z.string().default('1d'),
  // Add other necessary environment variables here
  // e.g., CORS_ORIGIN: z.string().url().optional(),
});

// Validate environment variables
let validatedEnv;
try {
  validatedEnv = envSchema.parse(process.env);
} catch (error) {
  // Check if the error is a Zod validation error
  if (error instanceof z.ZodError) {
    console.error(
      '❌ Invalid environment variables:', JSON.stringify(error.format(), null, 2),
    );
    // Optionally, provide more guidance based on the error
    if (process.env.DATABASE_TYPE === 'postgres' && !process.env.DATABASE_URL) {
      console.error('👉 DATABASE_URL is required when DATABASE_TYPE is postgres.');
    }
    if (process.env.DATABASE_TYPE === 'mongo' && !process.env.MONGO_URI) {
      console.error('👉 MONGO_URI is required when DATABASE_TYPE is mongo.');
    }
    process.exit(1); // Exit if validation fails
  } else {
    // Handle other potential error types if necessary
    console.error('❌ Unknown error validating environment variables:', error);
    process.exit(1);
  }
}

// Specific checks based on DATABASE_TYPE
if (validatedEnv.DATABASE_TYPE === 'postgres' && !validatedEnv.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required when DATABASE_TYPE is set to postgres.');
  process.exit(1);
}

if (validatedEnv.DATABASE_TYPE === 'mongo' && !validatedEnv.MONGO_URI) {
  console.error('❌ MONGO_URI environment variable is required when DATABASE_TYPE is set to mongo.');
  process.exit(1);
}

if (validatedEnv.JWT_SECRET === 'your-default-jwt-secret-key-32-chars' && validatedEnv.NODE_ENV === 'production') {
  console.warn(
    '⚠️ WARNING: Using default JWT_SECRET in production! Please set a strong, unique secret in your environment variables.'
  );
}

// Export the validated configuration object
const config = {
  nodeEnv: validatedEnv.NODE_ENV,
  port: validatedEnv.PORT,
  databaseType: validatedEnv.DATABASE_TYPE,
  databaseUrl: validatedEnv.DATABASE_URL,
  mongoUri: validatedEnv.MONGO_URI,
  jwt: {
    secret: validatedEnv.JWT_SECRET,
    expiresIn: validatedEnv.JWT_EXPIRES_IN,
  },
  // Add other config properties as needed
};

export default config; 