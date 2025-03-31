/**
 * Authentication Service
 * Handles API interactions for user authentication
 */
import axios from 'axios';
import { User } from '@contexts/AuthContext';

// Base API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001/api/v1';

// Token handling
const TOKEN_KEY = 'ecommerce_auth_token';

const setAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

const clearAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  delete axios.defaults.headers.common['Authorization'];
};

// Initialize axios with token if it exists
if (getAuthToken()) {
  const token = getAuthToken();
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}

// API calls
export const authService = {
  // Register a new user
  async register(userData: { email: string; password: string; username: string }): Promise<User> {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    const { user, token } = response.data;
    setAuthToken(token);
    return user;
  },

  // Login existing user
  async login(email: string, password: string): Promise<User> {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    const { user, token } = response.data;
    setAuthToken(token);
    return user;
  },

  // Get current authenticated user
  async getCurrentUser(): Promise<User | null> {
    if (!getAuthToken()) return null;
    
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      return response.data.user;
    } catch (error) {
      clearAuthToken();
      throw error;
    }
  },

  // Logout user
  logout(): void {
    clearAuthToken();
  },
}; 