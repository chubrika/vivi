import { API_BASE_URL } from '../utils/api';
import { getToken } from '../utils/authContext';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  seller: {
    _id: string;
    storeName: string;
    email: string;
  };
  category: {
    _id: string;
    name: string;
  };
  images: string[];
  isActive: boolean;
  productFeatureValues: any[];
  filters: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SearchProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  stock: number;
  seller: string;
  category: string;
  images: string[];
  isActive?: boolean;
  productFeatureValues?: any[];
  filters?: string[];
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  seller?: string;
  category?: string;
  images?: string[];
  isActive?: boolean;
  productFeatureValues?: any[];
  filters?: string[];
}

/**
 * Service for managing products
 */
export const productsService = {
  /**
   * Get all products
   * @param categoryId Optional category ID to filter by
   * @param sellerId Optional seller ID to filter by
   * @param filterId Optional filter ID to filter by
   * @returns Promise<Product[]> Array of products
   */
  async getAllProducts(categoryId?: string, sellerId?: string, filterId?: string): Promise<Product[]> {
    const queryParams = new URLSearchParams();
    if (categoryId) queryParams.append('category', categoryId);
    if (sellerId) queryParams.append('seller', sellerId);
    if (filterId) queryParams.append('filter', filterId);

    const response = await fetch(`${API_BASE_URL}/api/products?${queryParams.toString()}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch products');
    }

    return data;
  },

  /**
   * Get a product by ID
   * @param id Product ID
   * @returns Promise<Product> Product object
   */
  async getProductById(id: string): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch product');
    }

    return data;
  },

  /**
   * Search products using regex pattern
   * @param searchTerm Search term to match against product name and description
   * @param categoryId Optional category ID to filter by
   * @param sellerId Optional seller ID to filter by
   * @param page Page number for pagination
   * @param limit Number of items per page
   * @returns Promise<SearchProductsResponse> Search results with total count
   */
  async searchProducts(
    searchTerm: string,
    categoryId?: string,
    sellerId?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<SearchProductsResponse> {
    const queryParams = new URLSearchParams({
      search: searchTerm,
      page: page.toString(),
      limit: limit.toString(),
      ...(categoryId && { category: categoryId }),
      ...(sellerId && { seller: sellerId }),
    });

    const response = await fetch(`${API_BASE_URL}/api/products/search?${queryParams}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to search products');
    }

    return data;
  },

  /**
   * Create a new product
   * @param productData Product data
   * @returns Promise<Product> Created product
   */
  async createProduct(productData: CreateProductData): Promise<Product> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create product');
    }

    return data;
  },

  /**
   * Update an existing product
   * @param id Product ID
   * @param productData Updated product data
   * @returns Promise<Product> Updated product
   */
  async updateProduct(id: string, productData: UpdateProductData): Promise<Product> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update product');
    }

    return data;
  },

  /**
   * Delete a product
   * @param id Product ID
   * @returns Promise<{ message: string }> Success message
   */
  async deleteProduct(id: string): Promise<{ message: string }> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete product');
    }

    return data;
  },

  /**
   * Get products by category
   * @param categoryId Category ID
   * @returns Promise<Product[]> Array of products for the specified category
   */
  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/api/products/category/${categoryId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch products by category');
    }

    return data;
  },

  /**
   * Get products by seller
   * @param sellerId Seller ID
   * @returns Promise<Product[]> Array of products for the specified seller
   */
  async getProductsBySeller(sellerId: string): Promise<Product[]> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/products/seller/${sellerId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch products by seller');
    }

    return data;
  },
}; 