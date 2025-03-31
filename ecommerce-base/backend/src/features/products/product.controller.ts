/**
 * Product Controller
 * Handles HTTP requests for product operations
 */
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as productService from './product.service';
import { logger } from '@config/logger';
import { AppError } from '@utils/AppError';

/**
 * Create a new product
 * @route POST /api/products
 * @access Private - Admin only
 */
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await productService.createProduct(req.body);
    
    logger.info(`Product created: ${product._id}`);
    
    return res.status(StatusCodes.CREATED).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a product by ID
 * @route GET /api/products/:id
 * @access Public
 */
export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      throw new AppError('Product ID is required', StatusCodes.BAD_REQUEST);
    }
    
    const product = await productService.getProductById(id);
    
    return res.status(StatusCodes.OK).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a product
 * @route PUT /api/products/:id
 * @access Private - Admin only
 */
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      throw new AppError('Product ID is required', StatusCodes.BAD_REQUEST);
    }
    
    const product = await productService.updateProduct(id, req.body);
    
    logger.info(`Product updated: ${id}`);
    
    return res.status(StatusCodes.OK).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a product
 * @route DELETE /api/products/:id
 * @access Private - Admin only
 */
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      throw new AppError('Product ID is required', StatusCodes.BAD_REQUEST);
    }
    
    await productService.deleteProduct(id);
    
    logger.info(`Product deleted: ${id}`);
    
    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List products with filtering and pagination
 * @route GET /api/products
 * @access Public
 */
export const listProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = {
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      sortBy: req.query.sortBy as string | undefined,
      sortDirection: req.query.sortDirection as 'asc' | 'desc' | undefined,
      category: req.query.category as string | undefined,
      search: req.query.search as string | undefined,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
    };
    
    const products = await productService.listProducts(query);
    
    return res.status(StatusCodes.OK).json({
      success: true,
      ...products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all product categories
 * @route GET /api/products/categories
 * @access Public
 */
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await productService.getCategories();
    
    return res.status(StatusCodes.OK).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
}; 