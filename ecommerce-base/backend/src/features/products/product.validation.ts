/**
 * Product Validation Schemas
 * Defines validation rules for product-related API requests
 */
import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Product name must be at least 2 characters')
      .max(100, 'Product name cannot exceed 100 characters'),
    description: z
      .string()
      .min(5, 'Description must be at least 5 characters'),
    price: z
      .number()
      .min(0, 'Price cannot be negative')
      .or(z.string().regex(/^\d+(\.\d{1,2})?$/).transform(Number)),
    imageUrl: z
      .string()
      .url('Invalid image URL')
      .optional(),
    category: z
      .string()
      .min(2, 'Category must be at least 2 characters'),
    stock: z
      .number()
      .int('Stock must be an integer')
      .min(0, 'Stock cannot be negative')
      .or(z.string().regex(/^\d+$/).transform(Number))
      .optional()
      .default(0),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID format'),
  }),
  body: z.object({
    name: z
      .string()
      .min(2, 'Product name must be at least 2 characters')
      .max(100, 'Product name cannot exceed 100 characters')
      .optional(),
    description: z
      .string()
      .min(5, 'Description must be at least 5 characters')
      .optional(),
    price: z
      .number()
      .min(0, 'Price cannot be negative')
      .or(z.string().regex(/^\d+(\.\d{1,2})?$/).transform(Number))
      .optional(),
    imageUrl: z
      .string()
      .url('Invalid image URL')
      .optional(),
    category: z
      .string()
      .min(2, 'Category must be at least 2 characters')
      .optional(),
    stock: z
      .number()
      .int('Stock must be an integer')
      .min(0, 'Stock cannot be negative')
      .or(z.string().regex(/^\d+$/).transform(Number))
      .optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  }),
});

export const getProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID format'),
  }),
});

export const listProductsSchema = z.object({
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .optional(),
    limit: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .optional(),
    sortBy: z
      .string()
      .optional(),
    sortDirection: z
      .enum(['asc', 'desc'])
      .optional(),
    category: z
      .string()
      .optional(),
    search: z
      .string()
      .optional(),
    minPrice: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/)
      .transform(Number)
      .optional(),
    maxPrice: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/)
      .transform(Number)
      .optional(),
  }),
}); 