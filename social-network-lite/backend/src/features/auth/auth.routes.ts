/**
 * Auth Routes Placeholder
 * Defines API routes for authentication (register, login, me).
 */
import { Router } from 'express';
import { AuthController } from './auth.controller';
import { requireAuth } from '../../middleware/requireAuth';
// TODO: Import validation middleware and schemas when created

const authRouter = Router();
const authController = new AuthController();

// POST /api/auth/register
// TODO: Add validation middleware (e.g., validateRequest({ body: registerSchema }))
authRouter.post('/register', authController.register);

// POST /api/auth/login
// TODO: Add validation middleware (e.g., validateRequest({ body: loginSchema }))
authRouter.post('/login', authController.login);

// GET /api/auth/me
authRouter.get('/me', requireAuth, authController.getCurrentUser);

export default authRouter; 