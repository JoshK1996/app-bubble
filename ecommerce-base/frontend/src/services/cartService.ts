/**
 * Cart Service
 * Handles API interactions for the shopping cart
 */
import axios from 'axios';
import { CartItem } from '@contexts/CartContext';

// Base API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001/api/v1';

// Cart service methods
export const cartService = {
  // Get the current user's cart
  async getCart(): Promise<{ items: CartItem[] }> {
    const response = await axios.get(`${API_URL}/cart`);
    return response.data;
  },

  // Add a product to the cart
  async addToCart(productId: string, quantity: number): Promise<void> {
    await axios.post(`${API_URL}/cart/items`, { productId, quantity });
  },

  // Remove a product from the cart
  async removeFromCart(itemId: string): Promise<void> {
    await axios.delete(`${API_URL}/cart/items/${itemId}`);
  },

  // Update the quantity of a cart item
  async updateCartItemQuantity(itemId: string, quantity: number): Promise<void> {
    await axios.patch(`${API_URL}/cart/items/${itemId}`, { quantity });
  },

  // Clear the entire cart
  async clearCart(): Promise<void> {
    await axios.delete(`${API_URL}/cart`);
  },

  // Get product details (for local cart)
  async getProductDetails(productId: string): Promise<any> {
    const response = await axios.get(`${API_URL}/products/${productId}`);
    return response;
  },

  // Sync local cart with server (after login)
  async syncCart(items: CartItem[]): Promise<void> {
    await axios.post(`${API_URL}/cart/sync`, { items });
  },
}; 