/**
 * User Routes Placeholder
 * Defines API routes for user-related actions.
 */
import { Router } from 'express';
import { UserController } from './user.controller';
// TODO: Import middleware (auth, validation) when needed

const userRouter = Router();
const userController = new UserController();

// GET /api/users - Get all users (example, might need auth/admin)
userRouter.get('/', userController.getAllUsers);

// GET /api/users/:id - Get specific user by ID
// TODO: Add validation middleware for ID format
userRouter.get('/:id', userController.getUserById);

// Add other routes (update profile, etc.) later

export default userRouter; 