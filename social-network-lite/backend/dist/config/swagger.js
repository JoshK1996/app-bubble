"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
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
const setupSwagger = (app) => {
    // Generate OpenAPI specification
    const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
    // Serve Swagger UI
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec, {
        explorer: true,
    }));
    // Serve Swagger specification as JSON
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
    console.log('API Documentation available at /api-docs');
};
exports.setupSwagger = setupSwagger;
//# sourceMappingURL=swagger.js.map