/**
 * Cart Controller
 * Handles HTTP requests for cart operations
 */
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as cartService from './cart.service';
import { logger } from '@config/logger';
import { AppError } from '@utils/AppError';

/**
 * Get the current user's cart
 * @route GET /api/cart
 * @access Private
 */
export const getCart = async (
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

    const cart = await cartService.getCart(req.user.id);
    
    return res.status(StatusCodes.OK).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add item to cart
 * @route POST /api/cart/items
 * @access Private
 */
export const addItem = async (
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

    const { productId, quantity } = req.body;
    const cart = await cartService.addItem(req.user.id, productId, quantity);
    
    logger.info(`Product ${productId} added to cart for user ${req.user.id}`);
    
    return res.status(StatusCodes.OK).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update cart item quantity
 * @route PUT /api/cart/items/:itemId
 * @access Private
 */
export const updateItem = async (
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

    const { itemId } = req.params;
    
    if (!itemId) {
      throw new AppError('Item ID is required', StatusCodes.BAD_REQUEST);
    }
    
    const { quantity } = req.body;
    
    const cart = await cartService.updateItem(req.user.id, itemId, quantity);
    
    logger.info(`Cart item ${itemId} updated for user ${req.user.id}`);
    
    return res.status(StatusCodes.OK).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove item from cart
 * @route DELETE /api/cart/items/:itemId
 * @access Private
 */
export const removeItem = async (
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

    const { itemId } = req.params;
    
    if (!itemId) {
      throw new AppError('Item ID is required', StatusCodes.BAD_REQUEST);
    }
    
    const cart = await cartService.removeItem(req.user.id, itemId);
    
    logger.info(`Cart item ${itemId} removed for user ${req.user.id}`);
    
    return res.status(StatusCodes.OK).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear cart
 * @route DELETE /api/cart
 * @access Private
 */
export const clearCart = async (
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

    const cart = await cartService.clearCart(req.user.id);
    
    logger.info(`Cart cleared for user ${req.user.id}`);
    
    return res.status(StatusCodes.OK).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Sync cart with local storage
 * @route POST /api/cart/sync
 * @access Private
 */
export const syncCart = async (
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

    const { items } = req.body;
    
    if (!Array.isArray(items)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Items must be an array',
      });
    }
    
    const cart = await cartService.syncCart(req.user.id, items);
    
    logger.info(`Cart synced for user ${req.user.id}`);
    
    return res.status(StatusCodes.OK).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
}; 