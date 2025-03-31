/**
 * User Types Definitions
 * 
 * This module defines TypeScript interfaces and types related to users.
 * These types are used for API requests, responses, and internal data handling.
 */

/**
 * Enum representing the possible user roles in the system
 */
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

/**
 * User registration request data structure
 */
export interface UserRegisterRequest {
  email: string;
  password: string;
  name: string;
}

/**
 * User login request data structure
 */
export interface UserLoginRequest {
  email: string;
  password: string;
}

/**
 * User authentication response with JWT token
 */
export interface AuthResponse {
  token: string;
  user: UserResponse;
}

/**
 * Public user data that can be safely returned in API responses
 */
export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

/**
 * Database user entity with full user data
 */
export interface UserEntity {
  id: string;
  email: string;
  password: string; // Hashed password
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Payload stored in the JWT token
 */
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
} 