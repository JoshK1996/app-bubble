"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginValidation = exports.registerValidation = void 0;
/**
 * Authentication Request Validation
 * Defines validation rules for authentication-related requests
 */
const express_validator_1 = require("express-validator");
/**
 * Validation rules for user registration
 */
exports.registerValidation = [
    // Email validation
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please enter a valid email address')
        .normalizeEmail()
        .trim(),
    // Username validation
    (0, express_validator_1.body)('username')
        .isLength({ min: 3, max: 20 })
        .withMessage('Username must be between 3 and 20 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores')
        .trim(),
    // Password validation
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/\d/)
        .withMessage('Password must contain at least one number')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter'),
    // Full name validation
    (0, express_validator_1.body)('fullName')
        .isLength({ min: 2, max: 50 })
        .withMessage('Full name must be between 2 and 50 characters')
        .trim(),
];
/**
 * Validation rules for user login
 */
exports.loginValidation = [
    // Email validation
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please enter a valid email address')
        .normalizeEmail()
        .trim(),
    // Password validation (basic check that it exists)
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
];
//# sourceMappingURL=auth.validation.js.map