/**
 * Post Request Validation
 * Defines validation rules for post-related requests
 */
import { body } from 'express-validator';

/**
 * Validation rules for creating a post
 */
export const createPostValidation = [
  // Post content validation
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 }).withMessage('Post content must be between 1 and 1000 characters')
    .notEmpty().withMessage('Post content is required'),
];

/**
 * Validation rules for updating a post
 */
export const updatePostValidation = [
  // Post content validation
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 }).withMessage('Post content must be between 1 and 1000 characters')
    .notEmpty().withMessage('Post content is required'),
]; 