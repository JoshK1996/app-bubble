/**
 * Product Service
 * Handles business logic for product operations
 */
import { ProductModel, ProductDocument } from './product.model';
import { AppError } from '@utils/AppError';
import { StatusCodes } from 'http-status-codes';
import { logger } from '@config/logger';

interface ProductData {
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: string;
  stock: number;
}

interface ProductQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

interface ProductList {
  data: ProductDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Create a new product
 */
export const createProduct = async (productData: ProductData): Promise<ProductDocument> => {
  try {
    const product = await ProductModel.create(productData);
    return product;
  } catch (error) {
    logger.error('Error creating product:', error);
    throw new AppError('Failed to create product', StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Get a single product by ID
 */
export const getProductById = async (id: string): Promise<ProductDocument> => {
  const product = await ProductModel.findById(id);
  
  if (!product) {
    throw new AppError('Product not found', StatusCodes.NOT_FOUND);
  }
  
  return product;
};

/**
 * Update an existing product
 */
export const updateProduct = async (id: string, updates: Partial<ProductData>): Promise<ProductDocument> => {
  const product = await ProductModel.findByIdAndUpdate(
    id,
    updates,
    { new: true, runValidators: true }
  );
  
  if (!product) {
    throw new AppError('Product not found', StatusCodes.NOT_FOUND);
  }
  
  return product;
};

/**
 * Delete a product
 */
export const deleteProduct = async (id: string): Promise<void> => {
  const result = await ProductModel.findByIdAndDelete(id);
  
  if (!result) {
    throw new AppError('Product not found', StatusCodes.NOT_FOUND);
  }
};

/**
 * List products with filtering, sorting, and pagination
 */
export const listProducts = async (query: ProductQuery): Promise<ProductList> => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortDirection = 'desc',
      category,
      search,
      minPrice,
      maxPrice,
    } = query;
    
    // Build filter criteria
    const filter: Record<string, any> = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }
    
    if (search) {
      filter.$text = { $search: search };
    }
    
    // Build sort criteria
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortDirection === 'asc' ? 1 : -1,
    };
    
    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const [products, total] = await Promise.all([
      ProductModel.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit),
      ProductModel.countDocuments(filter),
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    return {
      data: products,
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    logger.error('Error listing products:', error);
    throw new AppError('Failed to retrieve products', StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Get all product categories
 */
export const getCategories = async (): Promise<string[]> => {
  try {
    const categories = await ProductModel.distinct('category');
    return categories;
  } catch (error) {
    logger.error('Error getting categories:', error);
    throw new AppError('Failed to retrieve categories', StatusCodes.INTERNAL_SERVER_ERROR);
  }
}; 