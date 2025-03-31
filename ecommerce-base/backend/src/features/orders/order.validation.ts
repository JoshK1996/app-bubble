/**
 * Order Validation Schemas
 * Defines validation rules for order-related API requests
 */
import { z } from 'zod';
import { OrderStatus } from './order.model';

// Validation schema for shipping address
const shippingAddressSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters'),
  addressLine1: z
    .string()
    .min(5, 'Address line 1 must be at least 5 characters')
    .max(100, 'Address line 1 cannot exceed 100 characters'),
  addressLine2: z
    .string()
    .max(100, 'Address line 2 cannot exceed 100 characters')
    .optional(),
  city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City cannot exceed 50 characters'),
  state: z
    .string()
    .min(2, 'State must be at least 2 characters')
    .max(50, 'State cannot exceed 50 characters'),
  postalCode: z
    .string()
    .min(3, 'Postal code must be at least 3 characters')
    .max(20, 'Postal code cannot exceed 20 characters'),
  country: z
    .string()
    .min(2, 'Country must be at least 2 characters')
    .max(50, 'Country cannot exceed 50 characters'),
  phoneNumber: z
    .string()
    .min(5, 'Phone number must be at least 5 characters')
    .max(20, 'Phone number cannot exceed 20 characters')
    .optional(),
});

// Schema for creating a new order
export const createOrderSchema = z.object({
  body: z.object({
    shippingAddress: shippingAddressSchema,
    paymentMethod: z
      .string()
      .min(2, 'Payment method must be at least 2 characters')
      .default('CREDIT_CARD'),
    notes: z
      .string()
      .max(500, 'Notes cannot exceed 500 characters')
      .optional(),
  }),
});

// Schema for getting a single order
export const getOrderSchema = z.object({
  params: z.object({
    id: z
      .string()
      .uuid('Order ID must be a valid UUID'),
  }),
});

// Schema for listing orders with pagination and filtering
export const listOrdersSchema = z.object({
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
    status: z
      .enum(Object.values(OrderStatus) as [string, ...string[]])
      .optional(),
    sortBy: z
      .enum(['createdAt', 'totalPrice', 'status'])
      .optional(),
    sortDirection: z
      .enum(['asc', 'desc'])
      .optional(),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
      .optional(),
  }),
});

// Schema for updating order status
export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z
      .string()
      .uuid('Order ID must be a valid UUID'),
  }),
  body: z.object({
    status: z
      .enum(Object.values(OrderStatus) as [string, ...string[]]),
  }),
});

// Schema for updating payment status
export const updatePaymentStatusSchema = z.object({
  params: z.object({
    id: z
      .string()
      .uuid('Order ID must be a valid UUID'),
  }),
  body: z.object({
    paymentStatus: z
      .enum(['PENDING', 'PAID', 'REFUNDED']),
  }),
}); 