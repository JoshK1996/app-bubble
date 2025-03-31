/**
 * Social Network Lite - Main Server Entry Point
 * Initializes the Express server, database connections, and core middleware
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/database';
import { setupSwagger } from './config/swagger';

// Load environment variables
dotenv.config();

// Initialize Express application
const app = express();
const port = process.env.PORT || 4000;

// Apply standard security and utility middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up API documentation with Swagger
setupSwagger(app);

// Initialize database connection
initializeDatabase()
  .then(() => {
    // Start server only after database is connected
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }); 