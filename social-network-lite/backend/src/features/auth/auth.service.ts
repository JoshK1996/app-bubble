/**
 * Authentication Service
 * Handles user registration, login, and token generation
 */
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { DatabaseType, getDatabaseType, prisma } from '../../config/database';
import { Role } from '../../types/role.enum';
import { UserModel } from '../users/user.schema';

// Define interfaces for service request and response
export interface RegisterUserRequest {
  email: string;
  username: string;
  password: string;
  fullName: string;
}

export interface LoginUserRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
    fullName: string;
    role: Role | any;
  };
}

/**
 * Service for handling user authentication
 */
export class AuthService {
  /**
   * Register a new user
   * @param userData User registration data
   * @returns Authentication response with token and user information
   */
  async register(userData: RegisterUserRequest): Promise<AuthResponse> {
    const {
      email, username, password, fullName,
    } = userData;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Determine which database to use
    const dbType = getDatabaseType();

    let user;
    if (dbType === DatabaseType.POSTGRES) {
      // Create user in PostgreSQL using Prisma
      user = await prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          fullName,
          role: Role.USER,
        },
      });
    } else {
      // Create user in MongoDB using Mongoose
      const newUser = new UserModel({
        email,
        username,
        password: hashedPassword,
        fullName,
        role: Role.USER,
      });
      user = await newUser.save();
    }

    // Generate JWT token
    const token = this.generateToken(user.id, Role.USER);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: Role.USER,
      },
    };
  }

  /**
   * Login a user
   * @param loginData User login credentials
   * @returns Authentication response with token and user information
   * @throws Error if login fails
   */
  async login(loginData: LoginUserRequest): Promise<AuthResponse> {
    const { email, password } = loginData;

    // Determine which database to use
    const dbType = getDatabaseType();

    // Find user by email
    let user;
    if (dbType === DatabaseType.POSTGRES) {
      user = await prisma.user.findUnique({
        where: { email },
      });
    } else {
      user = await UserModel.findOne({ email }).exec();
    }

    // Check if user exists
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
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
  async getCurrentUser(
    userId: string,
  ): Promise<Omit<AuthResponse['user'], 'token'>> {
    // Determine which database to use
    const dbType = getDatabaseType();

    // Find user by ID
    let user;
    if (dbType === DatabaseType.POSTGRES) {
      user = await prisma.user.findUnique({
        where: { id: userId },
      });
    } else {
      user = await UserModel.findById(userId).exec();
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
  private generateToken(userId: string, role: Role | any): string {
    const secret = process.env.JWT_SECRET || 'default_jwt_secret';
    
    // Use jwt.sign without the expiresIn option to avoid type issues
    return jwt.sign(
      {
        userId,
        role,
      },
      secret as jwt.Secret
    );
  }
}
