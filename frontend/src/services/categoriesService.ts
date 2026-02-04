import { API_BASE_URL } from '../utils/api';
import { getToken } from '../utils/authContext';

export interface Category {
  _id: string;
  name: string;
  description: string;
  slug: string;
  parentId?: string;
  hasChildren: boolean;
  isActive: boolean;
  icon?: string;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  slug: string;
  parentId?: string;
  isActive?: boolean;
  icon?: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  slug?: string;
  parentId?: string;
  isActive?: boolean;
  icon?: string;
}

/**
 * Service for managing categories
 */
export const categoriesService = {
  /**
   * Get all categories
   * @returns Promise<Category[]> Array of categories
   */
  async getAllCategories(): Promise<Category[]> {
    const response = await fetch(`${API_BASE_URL}/api/categories`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch categories');
    }

    return data;
  },

  /**
   * Get a category by ID
   * @param id Category ID
   * @returns Promise<Category> Category object
   */
  async getCategoryById(id: string): Promise<Category> {
    const response = await fetch(`${API_BASE_URL}/api/categories/${id}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch category');
    }

    return data;
  },

  /**
   * Create a new category
   * @param categoryData Category data
   * @returns Promise<Category> Created category
   */
  async createCategory(categoryData: CreateCategoryData): Promise<Category> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/categories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create category');
    }

    return data;
  },

  /**
   * Update an existing category
   * @param id Category ID
   * @param categoryData Updated category data
   * @returns Promise<Category> Updated category
   */
  async updateCategory(id: string, categoryData: UpdateCategoryData): Promise<Category> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update category');
    }

    return data;
  },

  /**
   * Delete a category
   * @param id Category ID
   * @returns Promise<{ message: string }> Success message
   */
  async deleteCategory(id: string): Promise<{ message: string }> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete category');
    }

    return data;
  },
}; 