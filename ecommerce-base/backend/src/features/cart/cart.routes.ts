/**
 * Cart Routes
 * Defines all API routes for cart operations
 */
import { Router } from 'express';
import * as cartController from './cart.controller';
import { validateRequest } from '@middleware/validateRequest';
import { requireAuth } from '@middleware/requireAuth';
import {
  addCartItemSchema,
  updateCartItemSchema,
  removeCartItemSchema,
  syncCartSchema,
} from './cart.validation';

const router = Router();

// All cart routes are protected and require authentication
router.use(requireAuth);

/**
 * @route GET /api/cart
 * @desc Get the current user's cart
 * @access Private
 */
router.get(
  '/',
  cartController.getCart
);

/**
 * @route POST /api/cart/items
 * @desc Add an item to the cart
 * @access Private
 */
router.post(
  '/items',
  validateRequest(addCartItemSchema),
  cartController.addItem
);

/**
 * @route PUT /api/cart/items/:itemId
 * @desc Update an item in the cart
 * @access Private
 */
router.put(
  '/items/:itemId',
  validateRequest(updateCartItemSchema),
  cartController.updateItem
);

/**
 * @route DELETE /api/cart/items/:itemId
 * @desc Remove an item from the cart
 * @access Private
 */
router.delete(
  '/items/:itemId',
  validateRequest(removeCartItemSchema),
  cartController.removeItem
);

/**
 * @route DELETE /api/cart
 * @desc Clear the entire cart
 * @access Private
 */
router.delete(
  '/',
  cartController.clearCart
);

/**
 * @route POST /api/cart/sync
 * @desc Sync the cart with local storage
 * @access Private
 */
router.post(
  '/sync',
  validateRequest(syncCartSchema),
  cartController.syncCart
);

export default router; 