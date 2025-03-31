/**
 * User Routes
 */
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { requireAuth } from '@middleware/requireAuth';
import { requireAdmin } from '@middleware/requireRole';

const router = Router();

/**
 * @route GET /api/v1/users
 * @description Get all users (admin only)
 * @access Admin
 */
router.get('/', requireAuth, requireAdmin, (req, res) => {
  // This is a placeholder - in a real implementation, this would call a controller/service
  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Get all users endpoint - to be implemented',
    data: {
      users: []
    }
  });
});

/**
 * @route GET /api/v1/users/profile
 * @description Get current user profile
 * @access Private
 */
router.get('/profile', requireAuth, (req, res) => {
  // This is a placeholder - in a real implementation, this would call a controller/service
  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Get user profile endpoint - to be implemented',
    data: {
      user: req.user
    }
  });
});

export default router; 