/**
 * Order Routes
 * API endpoints for order operations
 */
import express from 'express';
import * as orderController from './order.controller';
import { validateRequest } from '@middleware/validateRequest';
import { requireAuth } from '@middleware/requireAuth';
import { requireRole } from '@middleware/requireRole';
import { Role } from '@src/types/role.enum';
import { 
  createOrderSchema,
  getOrderSchema,
  listOrdersSchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema
} from './order.validation';

const router = express.Router();

// All order routes require authentication
router.use(requireAuth);

/**
 * @route POST /api/orders
 * @desc Create a new order from cart
 * @access Private
 */
router.post(
  '/',
  validateRequest(createOrderSchema),
  orderController.createOrder
);

/**
 * @route GET /api/orders
 * @desc List orders with filtering and pagination
 * @access Private
 */
router.get(
  '/',
  validateRequest(listOrdersSchema),
  orderController.listOrders
);

/**
 * @route GET /api/orders/statistics
 * @desc Get order statistics for current user
 * @access Private
 */
router.get(
  '/statistics',
  orderController.getOrderStatistics
);

/**
 * @route GET /api/orders/:id
 * @desc Get a single order by ID
 * @access Private
 */
router.get(
  '/:id',
  validateRequest(getOrderSchema),
  orderController.getOrder
);

/**
 * @route PATCH /api/orders/:id/status
 * @desc Update order status (admin only)
 * @access Private (Admin)
 */
router.patch(
  '/:id/status',
  requireRole([Role.ADMIN]),
  validateRequest(updateOrderStatusSchema),
  orderController.updateOrderStatus
);

/**
 * @route PATCH /api/orders/:id/payment
 * @desc Update payment status (admin only)
 * @access Private (Admin)
 */
router.patch(
  '/:id/payment',
  requireRole([Role.ADMIN]),
  validateRequest(updatePaymentStatusSchema),
  orderController.updatePaymentStatus
);

/**
 * @route PATCH /api/orders/:id/cancel
 * @desc Cancel an order
 * @access Private
 */
router.patch(
  '/:id/cancel',
  orderController.cancelOrder
);

export default router; 