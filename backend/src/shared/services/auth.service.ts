/**
 * Authentication Service
 * 
 * This service handles JWT token generation, verification, and user authentication.
 * It provides functions for working with JWTs and verifying user credentials.
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { env } from '../../config/env';
import { UserRole, JwtPayload } from '../../features/users/user.types';

/**
 * Generate a JWT token for a user
 * 
 * @param userId - The ID of the user
 * @param email - The email of the user
 * @param role - The role of the user
 * @returns The generated JWT token
 */
export const generateToken = (userId: string, email: string, role: UserRole): string => {
  const payload: JwtPayload = {
    userId,
    email,
    role,
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRATION,
  });
};

/**
 * Verify a JWT token and extract the payload
 * 
 * @param token - The JWT token to verify
 * @returns The decoded JWT payload if valid
 * @throws Error if the token is invalid
 */
export const verifyToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

/**
 * Hash a password using bcrypt
 * 
 * @param password - The plain text password to hash
 * @returns The hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

/**
 * Compare a plain text password with a hashed password
 * 
 * @param plainPassword - The plain text password to compare
 * @param hashedPassword - The hashed password to compare against
 * @returns True if the passwords match, false otherwise
 */
export const comparePasswords = async (
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
}; 