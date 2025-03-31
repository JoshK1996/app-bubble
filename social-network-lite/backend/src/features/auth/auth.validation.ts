/**
 * Authentication Request Validation
 * Defines validation rules for authentication-related requests
 */
import { body } from 'express-validator';

/**
 * Validation rules for user registration
 */
export const registerValidation = [
  // Email validation
  body('email')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail()
    .trim(),

  // Username validation
  body('username')
    .isLength({ min: 3, max: 20 }).withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores')
    .trim(),

  // Password validation
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .matches(/\d/).withMessage('Password must contain at least one number')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter'),

  // Full name validation
  body('fullName')
    .isLength({ min: 2, max: 50 }).withMessage('Full name must be between 2 and 50 characters')
    .trim(),
];

/**
 * Validation rules for user login
 */
export const loginValidation = [
  // Email validation
  body('email')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail()
    .trim(),

  // Password validation (basic check that it exists)
  body('password')
    .notEmpty().withMessage('Password is required'),
]; 