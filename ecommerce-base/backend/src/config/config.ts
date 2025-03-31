/**
 * Application Configuration
 * Loads environment variables and provides type-safe access.
 */
import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables from .env file relative to the backend root
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

// Define the schema for environment variables using Zod
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().positive().default(4001), // Default port for e-commerce
  DATABASE_TYPE: z.enum(['postgres', 'mongo', 'memory']).default('memory'),
  DATABASE_URL: z.string().url().optional(), 
  MONGO_URI: z.string().url().optional(), 
  JWT_SECRET: z.string().min(32, { message: 'JWT_SECRET must be at least 32 characters long' }).default('replace-this-with-a-strong-ecommerce-secret-key'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  CORS_ORIGIN: z.string().optional(), // Optional: Allow specific frontend origins
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).optional(),
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
    if (process.env.DATABASE_TYPE === 'postgres' && !process.env.DATABASE_URL) {
      console.error('👉 DATABASE_URL is required when DATABASE_TYPE is postgres.');
    }
    if (process.env.DATABASE_TYPE === 'mongo' && !process.env.MONGO_URI) {
      console.error('👉 MONGO_URI is required when DATABASE_TYPE is mongo.');
    }
    process.exit(1); 
  } else {
     // Handle other potential error types if necessary
    console.error('❌ Unknown error validating environment variables:', error);
    process.exit(1);
  }
}

// Specific checks
if (validatedEnv.DATABASE_TYPE === 'postgres' && !validatedEnv.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required when DATABASE_TYPE is set to postgres.');
  process.exit(1);
}
if (validatedEnv.DATABASE_TYPE === 'mongo' && !validatedEnv.MONGO_URI) {
  console.error('❌ MONGO_URI environment variable is required when DATABASE_TYPE is set to mongo.');
  process.exit(1);
}
if (validatedEnv.JWT_SECRET === 'replace-this-with-a-strong-ecommerce-secret-key' && validatedEnv.NODE_ENV === 'production') {
  console.warn(
    '⚠️ WARNING: Using default JWT_SECRET in production! Please set a strong, unique secret in your .env file.'
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
  corsOrigin: validatedEnv.CORS_ORIGIN?.split(',').map(origin => origin.trim()).filter(Boolean) || [], // Handle comma-separated origins
  logLevel: validatedEnv.LOG_LEVEL,
};

// Make config immutable
export default Object.freeze(config); 