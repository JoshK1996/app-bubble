"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
/**
 * Authentication Service
 * Handles user registration, login, and token generation
 */
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../../config/database");
const role_enum_1 = require("../../types/role.enum");
const user_schema_1 = require("../users/user.schema");
/**
 * Service for handling user authentication
 */
class AuthService {
    /**
     * Register a new user
     * @param userData User registration data
     * @returns Authentication response with token and user information
     */
    async register(userData) {
        const { email, username, password, fullName, } = userData;
        // Hash the password
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        // Determine which database to use
        const dbType = (0, database_1.getDatabaseType)();
        let user;
        if (dbType === database_1.DatabaseType.POSTGRES) {
            // Create user in PostgreSQL using Prisma
            user = await database_1.prisma.user.create({
                data: {
                    email,
                    username,
                    password: hashedPassword,
                    fullName,
                    role: role_enum_1.Role.USER,
                },
            });
        }
        else {
            // Create user in MongoDB using Mongoose
            const newUser = new user_schema_1.UserModel({
                email,
                username,
                password: hashedPassword,
                fullName,
                role: role_enum_1.Role.USER,
            });
            user = await newUser.save();
        }
        // Generate JWT token
        const token = this.generateToken(user.id, role_enum_1.Role.USER);
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                fullName: user.fullName,
                role: role_enum_1.Role.USER,
            },
        };
    }
    /**
     * Login a user
     * @param loginData User login credentials
     * @returns Authentication response with token and user information
     * @throws Error if login fails
     */
    async login(loginData) {
        const { email, password } = loginData;
        // Determine which database to use
        const dbType = (0, database_1.getDatabaseType)();
        // Find user by email
        let user;
        if (dbType === database_1.DatabaseType.POSTGRES) {
            user = await database_1.prisma.user.findUnique({
                where: { email },
            });
        }
        else {
            user = await user_schema_1.UserModel.findOne({ email }).exec();
        }
        // Check if user exists
        if (!user) {
            throw new Error('Invalid email or password');
        }
        // Verify password
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }
        // Generate JWT token
        const token = this.generateToken(user.id, user.role);
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                fullName: user.fullName,
                role: user.role,
            },
        };
    }
    /**
     * Get current user by ID
     * @param userId User ID to retrieve
     * @returns User information
     * @throws Error if user is not found
     */
    async getCurrentUser(userId) {
        // Determine which database to use
        const dbType = (0, database_1.getDatabaseType)();
        // Find user by ID
        let user;
        if (dbType === database_1.DatabaseType.POSTGRES) {
            user = await database_1.prisma.user.findUnique({
                where: { id: userId },
            });
        }
        else {
            user = await user_schema_1.UserModel.findById(userId).exec();
        }
        // Check if user exists
        if (!user) {
            throw new Error('User not found');
        }
        return {
            id: user.id,
            email: user.email,
            username: user.username,
            fullName: user.fullName,
            role: user.role,
        };
    }
    /**
     * Generate a JWT token for authentication
     * @param userId User ID to include in the token
     * @param role User role to include in the token
     * @returns JWT token string
     */
    generateToken(userId, role) {
        const secret = process.env.JWT_SECRET || 'default_jwt_secret';
        const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
        // Cast expiresIn to a valid type for SignOptions
        const options = {
            expiresIn: expiresIn
        };
        return jsonwebtoken_1.default.sign({
            userId,
            role,
        }, secret, options);
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map