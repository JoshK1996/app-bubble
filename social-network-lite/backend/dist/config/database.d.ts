import { PrismaClient } from '@prisma/client';
export declare enum DatabaseType {
    POSTGRES = "postgres",
    MONGO = "mongo"
}
/**
 * Initialize and provide the Prisma client instance for PostgreSQL
 */
export declare const prisma: PrismaClient<{
    datasources: {
        db: {
            url: string | undefined;
        };
    };
}, never, import("@prisma/client/runtime/library").DefaultArgs>;
/**
 * Connects to MongoDB using Mongoose
 * @returns A promise that resolves when connected
 */
export declare const connectMongo: () => Promise<void>;
/**
 * Get the currently selected database type
 * @returns The current database type (postgres or mongo)
 */
export declare const getDatabaseType: () => DatabaseType;
/**
 * Initializes the database connection based on the configured database type
 */
export declare const initializeDatabase: () => Promise<void>;
