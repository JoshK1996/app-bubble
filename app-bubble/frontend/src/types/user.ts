/**
 * User entity
 */
export interface User {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * User roles
 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

/**
 * Login request data
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Register request data
 */
export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

/**
 * Auth response with tokens
 */
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * Refresh token request
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * JWT payload structure
 */
export interface JwtPayload {
  id: string;
  email: string;
  role: string;
} 