"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePostValidation = exports.createPostValidation = void 0;
/**
 * Post Request Validation
 * Defines validation rules for post-related requests
 */
const express_validator_1 = require("express-validator");
/**
 * Validation rules for creating a post
 */
exports.createPostValidation = [
    // Post content validation
    (0, express_validator_1.body)('content')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Post content must be between 1 and 1000 characters')
        .notEmpty()
        .withMessage('Post content is required'),
];
/**
 * Validation rules for updating a post
 */
exports.updatePostValidation = [
    // Post content validation
    (0, express_validator_1.body)('content')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Post content must be between 1 and 1000 characters')
        .notEmpty()
        .withMessage('Post content is required'),
];
//# sourceMappingURL=post.validation.js.map