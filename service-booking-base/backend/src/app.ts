/**
 * Service Booking Platform Express App Setup
 */
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { StatusCodes } from 'http-status-codes';
import config from '@config/config';
import { logger } from '@config/logger';

// Import middleware
// import { errorHandler } from '@middleware/errorHandler';

// Import routes
// import userRoutes from '@features/users/user.routes';
// import serviceRoutes from '@features/services/service.routes';
// import bookingRoutes from '@features/bookings/booking.routes';
// import reviewRoutes from '@features/reviews/review.routes';

// Create Express app
const app = express();

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.corsOrigin.length ? config.corsOrigin : true, // true = allow all
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Request body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compress all responses
// @ts-ignore - Known TS issue with compression types
app.use(compression());

// HTTP request logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev', {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  }));
}

// API Version prefix
const API_PREFIX = config.apiPrefix;

// API Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Service Booking API is running',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// API Documentation Setup - uncomment when OpenAPI spec is available
// try {
//   const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));
//   app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
//   logger.info('API Documentation available at /api-docs');
// } catch (err) {
//   logger.warn('Could not load Swagger documentation', { error: err });
// }

// Mount API Routes
// app.use(`${API_PREFIX}/users`, userRoutes);
// app.use(`${API_PREFIX}/services`, serviceRoutes);
// app.use(`${API_PREFIX}/bookings`, bookingRoutes);
// app.use(`${API_PREFIX}/reviews`, reviewRoutes);

// Root path handler - Redirect to API docs or show basic info
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    name: 'Service Booking API',
    environment: config.nodeEnv,
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health'
  });
});

// 404 handler for undefined routes
app.all('*', (req: Request, _res: Response, next: NextFunction) => {
  const error = new Error(`Cannot find ${req.method} ${req.originalUrl} on this server.`);
  (error as any).statusCode = StatusCodes.NOT_FOUND;
  next(error);
});

// Global error handling middleware (uncomment when implemented)
// app.use(errorHandler);

export default app; 