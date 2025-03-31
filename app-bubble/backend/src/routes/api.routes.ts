import express from 'express';
import * as userController from '../features/users/user.controller';
import * as authController from '../features/auth/auth.controller';
import * as boardController from '../features/boards/board.controller';
import * as columnController from '../features/columns/column.controller';
import * as taskController from '../features/tasks/task.controller';
import { authenticate } from '../middlewares/auth.middleware';
import authRoutes from '../features/auth/auth.routes';
import userRoutes from '../features/users/user.routes';
import boardRoutes from '../features/boards/board.routes';
import blogRoutes from '../features/blog/blog.routes';

const router = express.Router();

// Auth routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/refresh', authController.refreshToken);

// User routes - protected by authentication
router.get('/users/me', authenticate, userController.getCurrentUser);
router.put('/users/me', authenticate, userController.updateCurrentUser);

// Board routes - protected by authentication
router.post('/boards', authenticate, boardController.createBoard);
router.get('/boards', authenticate, boardController.getUserBoards);
router.get('/boards/:id', authenticate, boardController.getBoardById);
router.put('/boards/:id', authenticate, boardController.updateBoard);
router.delete('/boards/:id', authenticate, boardController.deleteBoard);

// Column routes - protected by authentication
router.post('/boards/:boardId/columns', authenticate, columnController.createColumn);
router.get('/boards/:boardId/columns', authenticate, columnController.getBoardColumns);
router.put('/boards/:boardId/columns/reorder', authenticate, columnController.reorderColumns);
router.get('/columns/:id', authenticate, columnController.getColumnById);
router.put('/columns/:id', authenticate, columnController.updateColumn);
router.delete('/columns/:id', authenticate, columnController.deleteColumn);

// Task routes - protected by authentication
router.post('/columns/:columnId/tasks', authenticate, taskController.createTask);
router.get('/columns/:columnId/tasks', authenticate, taskController.getColumnTasks);
router.put('/columns/:columnId/tasks/reorder', authenticate, taskController.reorderTasks);
router.get('/tasks/:id', authenticate, taskController.getTaskById);
router.put('/tasks/:id', authenticate, taskController.updateTask);
router.delete('/tasks/:id', authenticate, taskController.deleteTask);
router.put('/tasks/:id/move', authenticate, taskController.moveTask);

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/boards', boardRoutes);
router.use('/blog', blogRoutes);

export default router; 