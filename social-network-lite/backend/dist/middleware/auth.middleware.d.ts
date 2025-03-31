/**
 * Authentication and Authorization middleware
 * Handles JWT verification and Role-Based Access Control (RBAC)
 */
import { Request, Response, NextFunction } from 'express';
import { Role } from '../types/role.enum';
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                role: Role;
            };
        }
    }
}
/**
 * Middleware to validate JWT tokens and extract user information
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware to check if user has the required role
 * @param role Required role to access the resource
 * @returns Express middleware function
 */
export declare const requireRole: (role: Role) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware to check if user is an admin
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export declare const requireAdmin: (req: Request, res: Response, next: NextFunction) => void;
