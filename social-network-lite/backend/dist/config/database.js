"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.getDatabaseType = exports.connectMongo = exports.prisma = exports.DatabaseType = void 0;
/**
 * Database configuration and connection setup
 * Handles dynamic selection between PostgreSQL (Prisma) and MongoDB (Mongoose)
 */
const mongoose_1 = __importDefault(require("mongoose"));
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Define database type constants
var DatabaseType;
(function (DatabaseType) {
    DatabaseType["POSTGRES"] = "postgres";
    DatabaseType["MONGO"] = "mongo";
})(DatabaseType || (exports.DatabaseType = DatabaseType = {}));
// Extract database configuration from environment variables
const { DATABASE_TYPE = DatabaseType.POSTGRES, DATABASE_URL, MONGODB_URI, NODE_ENV, TEST_DATABASE_URL, TEST_MONGODB_URI, } = process.env;
// Determine if we're in test environment
const isTestEnvironment = NODE_ENV === 'test';
// Select the appropriate connection string based on environment
const postgresConnectionString = isTestEnvironment
    ? TEST_DATABASE_URL
    : DATABASE_URL;
const mongoConnectionString = isTestEnvironment
    ? TEST_MONGODB_URI
    : MONGODB_URI;
/**
 * Initialize and provide the Prisma client instance for PostgreSQL
 */
exports.prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: postgresConnectionString,
        },
    },
});
/**
 * Connects to MongoDB using Mongoose
 * @returns A promise that resolves when connected
 */
const connectMongo = async () => {
    try {
        if (!mongoConnectionString) {
            throw new Error('MongoDB connection string is not defined in environment variables');
        }
        await mongoose_1.default.connect(mongoConnectionString);
        console.log('MongoDB connected successfully');
    }
    catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};
exports.connectMongo = connectMongo;
/**
 * Get the currently selected database type
 * @returns The current database type (postgres or mongo)
 */
const getDatabaseType = () => {
    const dbType = DATABASE_TYPE.toLowerCase();
    if (dbType !== DatabaseType.POSTGRES && dbType !== DatabaseType.MONGO) {
        console.warn(`Unsupported database type: ${dbType}. Falling back to PostgreSQL.`);
        return DatabaseType.POSTGRES;
    }
    return dbType;
};
exports.getDatabaseType = getDatabaseType;
/**
 * Initializes the database connection based on the configured database type
 */
const initializeDatabase = async () => {
    const dbType = (0, exports.getDatabaseType)();
    if (dbType === DatabaseType.MONGO) {
        await (0, exports.connectMongo)();
    }
    else {
        // For Prisma, we don't need to explicitly connect as it happens on first query
        // But we do need to handle any initialization errors
        try {
            // Run a simple query to test the connection
            await exports.prisma.$queryRaw `SELECT 1`;
            console.log('PostgreSQL connected successfully');
        }
        catch (error) {
            console.error('PostgreSQL connection error:', error);
            process.exit(1);
        }
    }
};
exports.initializeDatabase = initializeDatabase;
//# sourceMappingURL=database.js.map