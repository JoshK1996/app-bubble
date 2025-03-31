/**
 * Order Controller
 * Handles HTTP requests for order operations
 */
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as orderService from './order.service';
import { logger } from '@config/logger';
import { AppError } from '@utils/AppError';
import { OrderStatus } from './order.model';
import { Role } from '@src/types/role.enum';

/**
 * Create a new order from user's cart
 * @route POST /api/orders
 * @access Private
 */
export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const { shippingAddress, paymentMethod, notes } = req.body;
    
    const order = await orderService.createOrder({
      userId: req.user.id,
      shippingAddress,
      paymentMethod,
      notes,
    });
    
    logger.info(`Order created: ${order._id} by user: ${req.user.id}`);
    
    return res.status(StatusCodes.CREATED).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single order by ID
 * @route GET /api/orders/:id
 * @access Private
 */
export const getOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated',
      });
    }
    
    const { id } = req.params;
    
    if (!id) {
      throw new AppError('Order ID is required', StatusCodes.BAD_REQUEST);
    }
    
    // If admin, allow access to any order. Otherwise, verify ownership
    const options = req.user.role !== Role.ADMIN ? { userId: req.user.id } : undefined;
    
    const order = await orderService.getOrderById(id, options);
    
    return res.status(StatusCodes.OK).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List orders with filtering and pagination
 * @route GET /api/orders
 * @access Private
 */
export const listOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated',
      });
    }
    
    // Parse query parameters
    const query: any = {
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      status: req.query.status as OrderStatus | undefined,
      sortBy: req.query.sortBy as string | undefined,
      sortDirection: req.query.sortDirection as 'asc' | 'desc' | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
    };
    
    // If not admin, restrict to user's own orders
    if (req.user.role !== Role.ADMIN) {
      query.userId = req.user.id;
    }
    
    const orders = await orderService.listOrders(query);
    
    return res.status(StatusCodes.OK).json({
      success: true,
      ...orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update order status (admin only)
 * @route PATCH /api/orders/:id/status
 * @access Private (Admin)
 */
export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated',
      });
    }
    
    // Check admin role (also enforced by RBAC middleware)
    if (req.user.role !== Role.ADMIN) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Only administrators can update order status',
      });
    }
    
    const { id } = req.params;
    
    if (!id) {
      throw new AppError('Order ID is required', StatusCodes.BAD_REQUEST);
    }
    
    const { status } = req.body;
    
    const order = await orderService.updateOrderStatus(id, status, { adminOnly: true });
    
    logger.info(`Order ${id} status updated to ${status} by admin ${req.user.id}`);
    
    return res.status(StatusCodes.OK).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update payment status (admin only)
 * @route PATCH /api/orders/:id/payment
 * @access Private (Admin)
 */
export const updatePaymentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated',
      });
    }
    
    // Check admin role (also enforced by RBAC middleware)
    if (req.user.role !== Role.ADMIN) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Only administrators can update payment status',
      });
    }
    
    const { id } = req.params;
    
    if (!id) {
      throw new AppError('Order ID is required', StatusCodes.BAD_REQUEST);
    }
    
    const { paymentStatus } = req.body;
    
    const order = await orderService.updatePaymentStatus(id, paymentStatus);
    
    logger.info(`Order ${id} payment status updated to ${paymentStatus} by admin ${req.user.id}`);
    
    return res.status(StatusCodes.OK).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel an order (customer can cancel their own pending orders)
 * @route PATCH /api/orders/:id/cancel
 * @access Private
 */
export const cancelOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated',
      });
    }
    
    const { id } = req.params;
    
    if (!id) {
      throw new AppError('Order ID is required', StatusCodes.BAD_REQUEST);
    }
    
    const order = await orderService.cancelOrder(id, req.user.id);
    
    logger.info(`Order ${id} cancelled by user ${req.user.id}`);
    
    return res.status(StatusCodes.OK).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get order statistics for current user
 * @route GET /api/orders/statistics
 * @access Private
 */
export const getOrderStatistics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated',
      });
    }
    
    const statistics = await orderService.getUserOrderStatistics(req.user.id);
    
    return res.status(StatusCodes.OK).json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    next(error);
  }
}; 