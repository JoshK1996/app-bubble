/**
 * Swagger configuration for automatic API documentation
 */
import { Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

/**
 * Options for the Swagger JSDoc generator
 */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Social Network Lite API',
      version: '1.0.0',
      description: 'API documentation for the Social Network Lite application',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: '/api',
        description: 'API server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Path patterns to find API route documentation
  apis: ['./src/features/**/routes.ts', './src/types/**/*.ts'],
};

/**
 * Set up Swagger documentation middleware for Express
 * @param app Express application instance
 */
export const setupSwagger = (app: Express): void => {
  // Generate OpenAPI specification
  const swaggerSpec = swaggerJsdoc(swaggerOptions);

  // Serve Swagger UI
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
    }),
  );

  // Serve Swagger specification as JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('API Documentation available at /api-docs');
}; 