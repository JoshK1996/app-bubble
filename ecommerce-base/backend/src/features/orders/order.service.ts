/**
 * Order Service
 * Handles business logic for order operations
 */
import { OrderModel, OrderDocument, OrderStatus } from './order.model';
import { CartModel } from '@features/cart/cart.model';
import { ProductModel } from '@features/products/product.model';
import { AppError } from '@utils/AppError';
import { StatusCodes } from 'http-status-codes';
import { logger } from '@config/logger';

/**
 * Interface for shipping address
 */
interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
}

/**
 * Interface for creating an order
 */
interface CreateOrderData {
  userId: string;
  shippingAddress: ShippingAddress;
  paymentMethod?: string;
  notes?: string;
}

/**
 * Interface for order query parameters
 */
interface OrderQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
  userId?: string;
}

/**
 * Interface for paginated order list response
 */
interface OrderList {
  data: OrderDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Interface for order statistics
 */
export interface OrderStatistics {
  totalOrders: number;
  totalSpent: number;
  ordersByStatus: Record<OrderStatus, number>;
}

/**
 * Create a new order from user's cart
 */
export const createOrder = async (orderData: CreateOrderData): Promise<OrderDocument> => {
  try {
    const { userId, shippingAddress, paymentMethod = 'CREDIT_CARD', notes } = orderData;
    
    // Get the user's cart
    const cart = await CartModel.findOne({ userId });
    
    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart is empty', StatusCodes.BAD_REQUEST);
    }
    
    // Validate product availability and update stock
    for (const cartItem of cart.items) {
      const product = await ProductModel.findById(cartItem.productId);
      
      if (!product) {
        throw new AppError(`Product ${cartItem.productId} no longer exists`, StatusCodes.BAD_REQUEST);
      }
      
      if (product.stock < cartItem.quantity) {
        throw new AppError(
          `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${cartItem.quantity}`,
          StatusCodes.BAD_REQUEST
        );
      }
      
      // Reduce product stock
      product.stock -= cartItem.quantity;
      await product.save();
    }
    
    // Create order with items from cart
    const order = await OrderModel.create({
      userId,
      items: cart.items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      })),
      totalPrice: cart.totalPrice,
      status: OrderStatus.PENDING,
      shippingAddress,
      paymentMethod,
      paymentStatus: 'PENDING',
      notes,
    });
    
    // Clear the cart after successful order creation
    cart.items = [];
    await cart.save();
    
    logger.info(`Order created: ${order._id} for user: ${userId}`);
    
    return order;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error creating order:', error);
    throw new AppError('Failed to create order', StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Get a single order by ID, with option to verify user ownership
 */
export const getOrderById = async (id: string, options?: { userId?: string }): Promise<OrderDocument> => {
  try {
    const order = await OrderModel.findById(id);
    
    if (!order) {
      throw new AppError('Order not found', StatusCodes.NOT_FOUND);
    }
    
    // If userId provided, verify ownership
    if (options?.userId && order.userId !== options.userId) {
      throw new AppError('Unauthorized access to order', StatusCodes.FORBIDDEN);
    }
    
    return order;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error(`Error getting order ${id}:`, error);
    throw new AppError('Failed to retrieve order', StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * List orders with filtering, sorting, and pagination
 */
export const listOrders = async (query: OrderQuery): Promise<OrderList> => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'createdAt',
      sortDirection = 'desc',
      startDate,
      endDate,
      userId,
    } = query;
    
    // Build filter criteria
    const filter: Record<string, any> = {};
    
    if (userId) {
      filter.userId = userId;
    }
    
    if (status) {
      filter.status = status;
    }
    
    // Date range filtering
    if (startDate || endDate) {
      filter.createdAt = {};
      
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      
      if (endDate) {
        // Set time to end of day for the end date
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDateTime;
      }
    }
    
    // Build sort criteria
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortDirection === 'asc' ? 1 : -1,
    };
    
    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const [orders, total] = await Promise.all([
      OrderModel.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit),
      OrderModel.countDocuments(filter),
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    return {
      data: orders,
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    logger.error('Error listing orders:', error);
    throw new AppError('Failed to retrieve orders', StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (
  id: string,
  status: OrderStatus,
  options?: { adminOnly?: boolean }
): Promise<OrderDocument> => {
  try {
    const order = await OrderModel.findById(id);
    
    if (!order) {
      throw new AppError('Order not found', StatusCodes.NOT_FOUND);
    }
    
    // Admin-only status changes
    if (options?.adminOnly && (
      status === OrderStatus.PROCESSING ||
      status === OrderStatus.SHIPPED ||
      status === OrderStatus.DELIVERED
    )) {
      // This check will be enforced at the controller level
      // through RBAC middleware, but we double-check here
    }
    
    // Validation rules for status changes
    if (
      (order.status === OrderStatus.CANCELLED && status !== OrderStatus.CANCELLED) ||
      (order.status === OrderStatus.DELIVERED && status !== OrderStatus.DELIVERED)
    ) {
      throw new AppError(
        `Cannot change order status from ${order.status} to ${status}`,
        StatusCodes.BAD_REQUEST
      );
    }
    
    order.status = status;
    await order.save();
    
    logger.info(`Order ${id} status updated to ${status}`);
    
    return order;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error(`Error updating order ${id} status:`, error);
    throw new AppError('Failed to update order status', StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Update payment status
 */
export const updatePaymentStatus = async (
  id: string,
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED'
): Promise<OrderDocument> => {
  try {
    const order = await OrderModel.findById(id);
    
    if (!order) {
      throw new AppError('Order not found', StatusCodes.NOT_FOUND);
    }
    
    order.paymentStatus = paymentStatus;
    
    // If marked as paid, and order is still pending, move to processing
    if (paymentStatus === 'PAID' && order.status === OrderStatus.PENDING) {
      order.status = OrderStatus.PROCESSING;
    }
    
    // If refunded, mark order as cancelled if not delivered
    if (paymentStatus === 'REFUNDED' && order.status !== OrderStatus.DELIVERED) {
      order.status = OrderStatus.CANCELLED;
    }
    
    await order.save();
    
    logger.info(`Order ${id} payment status updated to ${paymentStatus}`);
    
    return order;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error(`Error updating order ${id} payment status:`, error);
    throw new AppError('Failed to update payment status', StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Cancel an order
 */
export const cancelOrder = async (id: string, userId: string): Promise<OrderDocument> => {
  try {
    const order = await OrderModel.findById(id);
    
    if (!order) {
      throw new AppError('Order not found', StatusCodes.NOT_FOUND);
    }
    
    // Verify ownership
    if (order.userId !== userId) {
      throw new AppError('Unauthorized access to order', StatusCodes.FORBIDDEN);
    }
    
    // Can only cancel if order is still in PENDING or PROCESSING status
    if (![OrderStatus.PENDING, OrderStatus.PROCESSING].includes(order.status)) {
      throw new AppError(
        `Cannot cancel order in ${order.status} status`,
        StatusCodes.BAD_REQUEST
      );
    }
    
    // Return items to inventory
    for (const orderItem of order.items) {
      const product = await ProductModel.findById(orderItem.productId);
      
      if (product) {
        product.stock += orderItem.quantity;
        await product.save();
        logger.info(`Returned ${orderItem.quantity} units of ${product._id} to inventory due to cancellation`);
      }
    }
    
    order.status = OrderStatus.CANCELLED;
    await order.save();
    
    logger.info(`Order ${id} cancelled by user ${userId}`);
    
    return order;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error(`Error cancelling order ${id}:`, error);
    throw new AppError('Failed to cancel order', StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Get order statistics for a user
 */
export const getUserOrderStatistics = async (userId: string): Promise<OrderStatistics> => {
  try {
    // Initialize statistics object with default values
    const statistics: OrderStatistics = {
      totalOrders: 0,
      totalSpent: 0,
      ordersByStatus: {
        [OrderStatus.PENDING]: 0,
        [OrderStatus.PROCESSING]: 0,
        [OrderStatus.SHIPPED]: 0,
        [OrderStatus.DELIVERED]: 0,
        [OrderStatus.CANCELLED]: 0,
      },
    };
    
    // Get all orders for user
    const orders = await OrderModel.find({ userId });
    
    if (orders.length === 0) {
      return statistics;
    }
    
    // Calculate total orders and spent
    statistics.totalOrders = orders.length;
    
    // Count by status and calculate total spent from non-cancelled orders
    orders.forEach(order => {
      // Increment status count
      statistics.ordersByStatus[order.status]++;
      
      // Only include non-cancelled orders in total spent
      if (order.status !== OrderStatus.CANCELLED) {
        statistics.totalSpent += order.totalPrice;
      }
    });
    
    return statistics;
  } catch (error) {
    logger.error(`Error getting order statistics for user ${userId}:`, error);
    throw new AppError('Failed to retrieve order statistics', StatusCodes.INTERNAL_SERVER_ERROR);
  }
}; 