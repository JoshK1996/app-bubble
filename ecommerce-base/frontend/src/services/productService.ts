/**
 * Product Service
 * Handles API interactions for products
 */
import axios from 'axios';

// Base API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001/api/v1';

// Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductListResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Product service methods
export const productService = {
  // Get all products (with filtering)
  async getProducts(params: ProductListParams = {}): Promise<Product[]> {
    const queryParams = new URLSearchParams();
    
    // Add query parameters
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
    if (params.category) queryParams.append('category', params.category);
    if (params.search) queryParams.append('search', params.search);
    if (params.minPrice) queryParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
    
    // Make the API call
    const queryString = queryParams.toString();
    const url = `${API_URL}/products${queryString ? `?${queryString}` : ''}`;
    
    const response = await axios.get<ProductListResponse>(url);
    return response.data.data;
  },

  // Get a single product by ID
  async getProduct(id: string): Promise<Product> {
    const response = await axios.get<{ data: Product }>(`${API_URL}/products/${id}`);
    return response.data.data;
  },

  // Get product categories
  async getCategories(): Promise<string[]> {
    const response = await axios.get<{ data: string[] }>(`${API_URL}/categories`);
    return response.data.data;
  },

  // Create a new product (admin)
  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const response = await axios.post<{ data: Product }>(`${API_URL}/products`, productData);
    return response.data.data;
  },

  // Update an existing product (admin)
  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    const response = await axios.put<{ data: Product }>(`${API_URL}/products/${id}`, productData);
    return response.data.data;
  },

  // Delete a product (admin)
  async deleteProduct(id: string): Promise<void> {
    await axios.delete(`${API_URL}/products/${id}`);
  },
}; 