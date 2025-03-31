"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.requireRole = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const role_enum_1 = require("../types/role.enum");
/**
 * Middleware to validate JWT tokens and extract user information
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
const authenticate = (req, res, next) => {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Access denied. No token provided.' });
        return;
    }
    try {
        // Verify token and extract payload
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'default_jwt_secret');
        // Attach user information to request for use in route handlers
        req.user = {
            userId: decoded.userId,
            role: decoded.role,
        };
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Invalid token.' });
    }
};
exports.authenticate = authenticate;
/**
 * Middleware to check if user has the required role
 * @param role Required role to access the resource
 * @returns Express middleware function
 */
const requireRole = (role) => (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
    }
    // Check if user has the required role
    if (req.user.role !== role) {
        res.status(403).json({
            message: `Access denied. Role '${role}' required.`,
        });
        return;
    }
    next();
};
exports.requireRole = requireRole;
/**
 * Middleware to check if user is an admin
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
const requireAdmin = (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
    }
    // Check if user is an admin
    if (req.user.role !== role_enum_1.Role.ADMIN) {
        res.status(403).json({
            message: 'Access denied. Admin role required.',
        });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=auth.middleware.js.map