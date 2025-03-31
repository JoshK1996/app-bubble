"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Social Network Lite - Main Server Entry Point
 * Initializes the Express server, database connections, and core middleware
 */
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const swagger_1 = require("./config/swagger");
const auth_routes_1 = __importDefault(require("./features/auth/auth.routes"));
const post_routes_1 = __importDefault(require("./features/posts/post.routes"));
const follow_routes_1 = __importDefault(require("./features/follow/follow.routes"));
// Load environment variables
dotenv_1.default.config();
// Initialize Express application
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
// Apply standard security and utility middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Set up API routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/posts', post_routes_1.default);
app.use('/api/follow', follow_routes_1.default);
// Set up API documentation with Swagger
(0, swagger_1.setupSwagger)(app);
// Initialize database connection
(0, database_1.initializeDatabase)()
    .then(() => {
    // Start server only after database is connected
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
        console.log(`API Documentation available at http://localhost:${port}/api-docs`);
    });
})
    .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map