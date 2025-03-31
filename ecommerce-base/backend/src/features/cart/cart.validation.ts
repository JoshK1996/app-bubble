/**
 * Cart Validation Schemas
 * Defines validation rules for cart-related API requests
 */
import { z } from 'zod';

export const addCartItemSchema = z.object({
  body: z.object({
    productId: z
      .string()
      .uuid('Product ID must be a valid UUID'),
    quantity: z
      .number()
      .int('Quantity must be an integer')
      .min(1, 'Quantity must be at least 1')
      .default(1)
      .or(z.string().regex(/^\d+$/).transform(Number)),
  }),
});

export const updateCartItemSchema = z.object({
  params: z.object({
    itemId: z
      .string()
      .uuid('Cart item ID must be a valid UUID'),
  }),
  body: z.object({
    quantity: z
      .number()
      .int('Quantity must be an integer')
      .min(1, 'Quantity must be at least 1')
      .or(z.string().regex(/^\d+$/).transform(Number)),
  }),
});

export const removeCartItemSchema = z.object({
  params: z.object({
    itemId: z
      .string()
      .uuid('Cart item ID must be a valid UUID'),
  }),
});

export const syncCartSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        productId: z
          .string()
          .uuid('Product ID must be a valid UUID'),
        quantity: z
          .number()
          .int('Quantity must be an integer')
          .min(1, 'Quantity must be at least 1')
          .or(z.string().regex(/^\d+$/).transform(Number)),
      })
    ),
  }),
}); 