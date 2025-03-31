/**
 * Product Routes
 * Defines all API routes for product operations
 */
import { Router } from 'express';
import * as productController from './product.controller';
import { validateRequest } from '@middleware/validateRequest';
import { requireAuth } from '@middleware/requireAuth';
import { Role } from '@src/types/role.enum';
import {
  createProductSchema,
  updateProductSchema,
  getProductSchema,
  listProductsSchema,
} from './product.validation';

const router = Router();

// Route order matters - place specific routes before dynamic ones
// Categories route must come before :id route

/**
 * @route GET /api/products/categories
 * @desc Get all product categories
 * @access Public
 */
router.get(
  '/categories',
  productController.getCategories
);

// Public routes
/**
 * @route GET /api/products
 * @desc List products with filtering and pagination
 * @access Public
 */
router.get(
  '/',
  validateRequest(listProductsSchema),
  productController.listProducts
);

/**
 * @route GET /api/products/:id
 * @desc Get a product by ID
 * @access Public
 */
router.get(
  '/:id',
  validateRequest(getProductSchema),
  productController.getProduct
);

// Protected routes (admin only)
/**
 * @route POST /api/products
 * @desc Create a new product
 * @access Private - Admin only
 */
router.post(
  '/',
  requireAuth,
  validateRequest(createProductSchema),
  productController.createProduct
);

/**
 * @route PUT /api/products/:id
 * @desc Update a product
 * @access Private - Admin only
 */
router.put(
  '/:id',
  requireAuth,
  validateRequest(updateProductSchema),
  productController.updateProduct
);

/**
 * @route DELETE /api/products/:id
 * @desc Delete a product
 * @access Private - Admin only
 */
router.delete(
  '/:id',
  requireAuth,
  validateRequest(getProductSchema),
  productController.deleteProduct
);

export default router; 