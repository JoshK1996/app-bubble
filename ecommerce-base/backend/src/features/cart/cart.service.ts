/**
 * Cart Service
 * Handles business logic for cart operations
 */
import { CartModel, CartDocument, CartItemDocument } from './cart.model';
import { ProductModel } from '@features/products/product.model';
import { AppError } from '@utils/AppError';
import { StatusCodes } from 'http-status-codes';
import { logger } from '@config/logger';

/**
 * Get or create cart for a user
 */
export const getCart = async (userId: string): Promise<CartDocument> => {
  try {
    let cart = await CartModel.findOne({ userId });
    
    if (!cart) {
      // Create a new cart if none exists
      cart = await CartModel.create({
        userId,
        items: [],
        totalPrice: 0,
      });
      logger.info(`Created new cart for user: ${userId}`);
    }
    
    return cart;
  } catch (error) {
    logger.error('Error getting cart:', error);
    throw new AppError('Failed to retrieve cart', StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Add item to cart
 */
export const addItem = async (
  userId: string,
  productId: string,
  quantity: number = 1
): Promise<CartDocument> => {
  try {
    // Validate that product exists
    const product = await ProductModel.findById(productId);
    
    if (!product) {
      throw new AppError('Product not found', StatusCodes.NOT_FOUND);
    }
    
    // Check if product has enough stock
    if (product.stock < quantity) {
      throw new AppError(
        `Insufficient stock. Only ${product.stock} items available`,
        StatusCodes.BAD_REQUEST
      );
    }
    
    // Get or create cart
    const cart = await getCart(userId);
    
    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productId === productId
    );
    
    if (existingItemIndex > -1) {
      // Update quantity if item exists
      const existingItem = cart.items[existingItemIndex];
      if (!existingItem) {
        throw new AppError('Cart item not found', StatusCodes.INTERNAL_SERVER_ERROR);
      }
      
      const newQuantity = existingItem.quantity + quantity;
      
      // Check if new quantity exceeds stock
      if (newQuantity > product.stock) {
        throw new AppError(
          `Cannot add ${quantity} more items. Only ${product.stock - existingItem.quantity} more available`,
          StatusCodes.BAD_REQUEST
        );
      }
      
      existingItem.quantity = newQuantity;
    } else {
      // Add new item to cart - using create method instead of direct push
      const newItem = {
        productId: product._id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl || '',
        quantity,
      };
      
      // @ts-ignore: MongoDB will handle the _id
      cart.items.push(newItem);
    }
    
    await cart.save();
    return cart;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error adding item to cart:', error);
    throw new AppError('Failed to add item to cart', StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Update cart item quantity
 */
export const updateItem = async (
  userId: string,
  itemId: string,
  quantity: number
): Promise<CartDocument> => {
  try {
    const cart = await CartModel.findOne({ userId });
    
    if (!cart) {
      throw new AppError('Cart not found', StatusCodes.NOT_FOUND);
    }
    
    // Find the item in the cart
    const itemIndex = cart.items.findIndex(item => item._id === itemId);
    
    if (itemIndex === -1) {
      throw new AppError('Item not found in cart', StatusCodes.NOT_FOUND);
    }
    
    const cartItem = cart.items[itemIndex];
    if (!cartItem) {
      throw new AppError('Cart item not found', StatusCodes.INTERNAL_SERVER_ERROR);
    }
    
    // Validate that product has enough stock
    const product = await ProductModel.findById(cartItem.productId);
    
    if (!product) {
      throw new AppError('Product no longer exists', StatusCodes.NOT_FOUND);
    }
    
    if (product.stock < quantity) {
      throw new AppError(
        `Insufficient stock. Only ${product.stock} items available`,
        StatusCodes.BAD_REQUEST
      );
    }
    
    // Update the quantity
    cartItem.quantity = quantity;
    
    await cart.save();
    return cart;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error updating cart item:', error);
    throw new AppError('Failed to update cart item', StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Remove item from cart
 */
export const removeItem = async (
  userId: string,
  itemId: string
): Promise<CartDocument> => {
  try {
    const cart = await CartModel.findOne({ userId });
    
    if (!cart) {
      throw new AppError('Cart not found', StatusCodes.NOT_FOUND);
    }
    
    // Find the item in the cart
    const itemIndex = cart.items.findIndex(item => item._id === itemId);
    
    if (itemIndex === -1) {
      throw new AppError('Item not found in cart', StatusCodes.NOT_FOUND);
    }
    
    // Remove the item
    cart.items.splice(itemIndex, 1);
    
    await cart.save();
    return cart;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error removing cart item:', error);
    throw new AppError('Failed to remove item from cart', StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Clear cart - remove all items
 */
export const clearCart = async (userId: string): Promise<CartDocument> => {
  try {
    const cart = await CartModel.findOne({ userId });
    
    if (!cart) {
      throw new AppError('Cart not found', StatusCodes.NOT_FOUND);
    }
    
    cart.items = [];
    await cart.save();
    
    return cart;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error clearing cart:', error);
    throw new AppError('Failed to clear cart', StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Sync cart - replace cart items with provided items
 * Useful for syncing local cart with server after login
 */
export const syncCart = async (
  userId: string,
  items: { productId: string; quantity: number }[]
): Promise<CartDocument> => {
  try {
    // First clear the cart
    await clearCart(userId);
    
    // Get the empty cart
    const cart = await getCart(userId);
    
    // For each item, add it to the cart individually
    for (const item of items) {
      const product = await ProductModel.findById(item.productId);
      
      if (!product) {
        logger.warn(`Product ${item.productId} not found during cart sync`);
        continue; // Skip invalid products
      }
      
      // Limit quantity to available stock
      const quantity = Math.min(item.quantity, product.stock);
      
      if (quantity <= 0) {
        logger.warn(`Product ${item.productId} has insufficient stock during cart sync`);
        continue; // Skip out of stock products
      }
      
      // Add item to cart one by one to ensure proper validation
      try {
        // @ts-ignore: MongoDB will handle the _id
        cart.items.push({
          productId: product._id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl || '',
          quantity,
        });
      } catch (err) {
        logger.warn(`Failed to add product ${item.productId} during cart sync: ${err}`);
        // Continue with other products even if one fails
      }
    }
    
    await cart.save();
    return cart;
  } catch (error) {
    logger.error('Error syncing cart:', error);
    throw new AppError('Failed to sync cart', StatusCodes.INTERNAL_SERVER_ERROR);
  }
}; 