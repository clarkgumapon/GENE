/**
 * API client for communicating with the backend server
 */

import type { Product, CartItem, Review } from "@/lib/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Base API client for making HTTP requests to the backend
 */
class ApiClient {
  private token: string | null = null;

  constructor() {
    // Initialize token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('egadget_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('egadget_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('egadget_token');
    }
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async get(endpoint: string) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (response.status === 401) {
        this.clearToken();
        throw new Error('Unauthorized - Please log in again');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `API error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error(`API GET error (${endpoint}):`, error);
      throw error;
    }
  }

  async post(endpoint: string, data: any) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (response.status === 401) {
        this.clearToken();
        throw new Error('Unauthorized - Please log in again');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `API error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error(`API POST error (${endpoint}):`, error);
      throw error;
    }
  }

  async put(endpoint: string, data: any) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (response.status === 401) {
        this.clearToken();
        throw new Error('Unauthorized - Please log in again');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `API error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error(`API PUT error (${endpoint}):`, error);
      throw error;
    }
  }

  async delete(endpoint: string) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (response.status === 401) {
        this.clearToken();
        throw new Error('Unauthorized - Please log in again');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `API error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error(`API DELETE error (${endpoint}):`, error);
      throw error;
    }
  }
}

/**
 * Auth-related API methods
 */
export class AuthApi {
  private api: ApiClient;

  constructor(api: ApiClient) {
    this.api = api;
  }

  async login(email: string, password: string) {
    const data = await this.api.post('/auth/login', { email, password });
    this.api.setToken(data.token);
    return data.user;
  }

  async register(name: string, email: string, password: string) {
    const data = await this.api.post('/auth/register', { name, email, password });
    this.api.setToken(data.token);
    return data.user;
  }

  async checkAuth() {
    try {
      const data = await this.api.get('/auth/check');
      return data;
    } catch (error) {
      // Handle authentication errors by clearing the token
      console.warn('Authentication check failed:', error);
      this.api.clearToken();
      return { authenticated: false };
    }
  }

  async getCurrentUser() {
    try {
      const data = await this.api.get('/auth/me');
      return data.user;
    } catch (error) {
      console.error('Failed to get current user:', error);
      this.api.clearToken();
      throw error;
    }
  }

  async logout() {
    this.api.clearToken();
  }
}

/**
 * Product-related API methods
 */
export class ProductApi {
  private api: ApiClient;

  constructor(api: ApiClient) {
    this.api = api;
  }

  async getProducts(filters?: Record<string, any>): Promise<Product[]> {
    const queryParams = filters ? 
      '?' + Object.entries(filters)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&')
      : '';

    const data = await this.api.get(`/products${queryParams}`);
    return this.mapProductsResponse(data.products);
  }

  async getProductById(id: string | number): Promise<Product> {
    const data = await this.api.get(`/products/${id}`);
    return this.mapProductResponse(data.product);
  }

  async addReview(productId: string | number, rating: number, comment: string): Promise<Product> {
    const data = await this.api.post(`/products/${productId}/reviews`, { rating, comment });
    return this.mapProductResponse(data.product);
  }

  // Map backend response to frontend Product type
  private mapProductResponse(product: any): Product {
    return {
      id: product.id.toString(),
      name: product.name,
      description: product.description || '',
      fullDescription: product.description || '',
      price: product.price,
      originalPrice: product.originalPrice,
      discount: product.discount || 0,
      rating: product.rating || 0,
      stock: product.stock || 0,
      sold: 0, // Backend doesn't track this yet
      category: product.category || '',
      brand: '', // Backend doesn't track this yet
      sku: '', // Backend doesn't track this yet
      images: product.images || [],
      features: [], // Backend doesn't track this yet
      specifications: {}, // Backend doesn't track this yet
      reviews: product.reviews?.map((review: any) => ({
        id: review.id.toString(),
        name: review.user?.name || 'Anonymous',
        rating: review.rating,
        comment: review.comment,
        date: review.createdAt,
      })) || [],
      isNew: product.isNew || false,
      featured: false, // Backend doesn't track this yet
      trending: product.trending || false,
      createdAt: product.createdAt || new Date().toISOString(),
    };
  }

  private mapProductsResponse(products: any[]): Product[] {
    return products.map(product => this.mapProductResponse(product));
  }
}

/**
 * Cart-related API methods
 */
export class CartApi {
  private api: ApiClient;

  constructor(api: ApiClient) {
    this.api = api;
  }

  async getCart() {
    try {
      const data = await this.api.get('/cart');
      return data;
    } catch (error) {
      console.warn('Error fetching cart, returning empty cart:', error);
      // Return empty cart on error
      return {
        items: [],
        total: 0,
        count: 0
      };
    }
  }

  async addToCart(productId: string | number, quantity: number) {
    try {
      const data = await this.api.post('/cart', { product_id: productId, quantity });
      return data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  async updateCartItem(itemId: string | number, quantity: number) {
    try {
      const data = await this.api.put(`/cart/${itemId}`, { quantity });
      return data;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  }

  async removeFromCart(itemId: string | number) {
    try {
      const data = await this.api.delete(`/cart/${itemId}`);
      return data;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }

  async clearCart() {
    try {
      const data = await this.api.delete('/cart');
      return data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }
}

// Create and export API instances
const apiClient = new ApiClient();
export const authApi = new AuthApi(apiClient);
export const productApi = new ProductApi(apiClient);
export const cartApi = new CartApi(apiClient); 