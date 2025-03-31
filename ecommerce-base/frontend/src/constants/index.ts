/**
 * Application Constants
 */

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    ME: '/auth/me',
  },
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id: string) => `/products/${id}`,
    CATEGORIES: '/categories',
  },
  CART: {
    LIST: '/cart',
    ITEMS: '/cart/items',
    ITEM: (id: string) => `/cart/items/${id}`,
    SYNC: '/cart/sync',
  },
  ORDERS: {
    LIST: '/orders',
    DETAIL: (id: string) => `/orders/${id}`,
    CANCEL: (id: string) => `/orders/${id}/cancel`,
    STATS: '/orders/stats',
  },
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'ecommerce_auth_token',
  CART: 'ecommerce_cart',
};

// Routes
export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (id: string) => `/products/${id}`,
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  ORDER_DETAIL: (id: string) => `/orders/${id}`,
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
};

// Order status types
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

// User roles
export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
} 