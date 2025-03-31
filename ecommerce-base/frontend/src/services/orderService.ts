/**
 * Order Service
 * Handles API interactions for orders
 */
import axios from 'axios';

// Base API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export interface OrderItem {
  productId: string;
  quantity: number;
  price?: number;
  name?: string;
}

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface OrderCreateData {
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod?: string;
  paymentDetails?: Record<string, any>;
}

export interface OrderSummary {
  id: string;
  createdAt: string;
  status: string;
  totalItems: number;
  totalPrice: number;
}

export interface OrderDetail extends OrderSummary {
  items: Array<OrderItem & { 
    name: string;
    price: number;
    imageUrl?: string;
  }>;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentStatus: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
}

export const orderService = {
  /**
   * Get all orders for the current user
   */
  async getOrders(): Promise<OrderSummary[]> {
    try {
      const response = await axios.get(`${API_URL}/orders`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  /**
   * Get a specific order by ID
   */
  async getOrder(orderId: string): Promise<OrderDetail> {
    try {
      const response = await axios.get(`${API_URL}/orders/${orderId}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new order
   */
  async createOrder(orderData: OrderCreateData): Promise<OrderDetail> {
    try {
      const response = await axios.post(`${API_URL}/orders`, orderData, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  /**
   * Cancel an order if it's still in a cancelable state
   */
  async cancelOrder(orderId: string): Promise<OrderDetail> {
    try {
      const response = await axios.post(`${API_URL}/orders/${orderId}/cancel`, {}, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error(`Error canceling order ${orderId}:`, error);
      throw error;
    }
  },

  /**
   * Get order history statistics (counts by status, total spent, etc.)
   */
  async getOrderStats(): Promise<{
    totalOrders: number;
    totalSpent: number;
    ordersByStatus: Record<string, number>;
  }> {
    try {
      const response = await axios.get(`${API_URL}/orders/stats`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching order statistics:', error);
      throw error;
    }
  }
};

export default orderService; 