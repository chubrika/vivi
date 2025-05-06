import { API_BASE_URL } from '../utils/api';
import { getToken } from '../utils/authContext';

export interface Filter {
  _id: string;
  name: string;
  description: string;
  category: {
    _id: string;
    name: string;
  };
  type: 'select' | 'range' | 'color' | 'boolean';
  config?: {
    options?: string[];
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    color?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFilterData {
  name: string;
  description: string;
  category: string;
  type: 'select' | 'range' | 'color' | 'boolean';
  config?: {
    options?: string[];
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    color?: string;
  };
}

export interface UpdateFilterData {
  name?: string;
  description?: string;
  category?: string;
  type?: 'select' | 'range' | 'color' | 'boolean';
  config?: {
    options?: string[];
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    color?: string;
  };
  isActive?: boolean;
}

export interface SearchFiltersResponse {
  filters: Filter[];
  total: number;
}

/**
 * Service for managing filters
 */
export const filtersService = {
  /**
   * Get all filters
   * @returns Promise<Filter[]> Array of filters
   */
  async getAllFilters(): Promise<Filter[]> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/filters`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch filters');
    }

    return data;
  },

  /**
   * Get a filter by ID
   * @param id Filter ID
   * @returns Promise<Filter> Filter object
   */
  async getFilterById(id: string): Promise<Filter> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/filters/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch filter');
    }

    return data;
  },

  /**
   * Get filters by category ID
   * @param categoryId Category ID
   * @returns Promise<Filter[]> Array of filters for the specified category
   */
  async getFiltersByCategory(categoryId: string): Promise<Filter[]> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/filters?category=${categoryId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch filters by category');
    }

    return data;
  },

  /**
   * Get active filters
   * @returns Promise<Filter[]> Array of active filters
   */
  async getActiveFilters(): Promise<Filter[]> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/filters?isActive=true`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch active filters');
    }

    return data;
  },

  /**
   * Create a new filter
   * @param filterData Filter data
   * @returns Promise<Filter> Created filter
   */
  async createFilter(filterData: CreateFilterData): Promise<Filter> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/filters`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filterData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create filter');
    }

    return data;
  },

  /**
   * Update an existing filter
   * @param id Filter ID
   * @param filterData Updated filter data
   * @returns Promise<Filter> Updated filter
   */
  async updateFilter(id: string, filterData: UpdateFilterData): Promise<Filter> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/filters/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filterData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update filter');
    }

    return data;
  },

  /**
   * Delete a filter
   * @param id Filter ID
   * @returns Promise<{ message: string }> Success message
   */
  async deleteFilter(id: string): Promise<{ message: string }> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/filters/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete filter');
    }

    return data;
  },

  /**
   * Toggle a filter's active status
   * @param id Filter ID
   * @returns Promise<Filter> Updated filter
   */
  async toggleFilterStatus(id: string): Promise<Filter> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/filters/${id}/toggle`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to toggle filter status');
    }

    return data;
  },

  /**
   * Search filters using regex pattern
   * @param searchTerm Search term to match against filter name and description
   * @param categoryId Optional category ID to filter by
   * @param page Page number for pagination
   * @param limit Number of items per page
   * @returns Promise<SearchFiltersResponse> Search results with total count
   */
  async searchFilters(
    searchTerm: string,
    categoryId?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<SearchFiltersResponse> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const queryParams = new URLSearchParams({
      search: searchTerm,
      page: page.toString(),
      limit: limit.toString(),
      ...(categoryId && { category: categoryId }),
    });

    const response = await fetch(`${API_BASE_URL}/api/filters/search?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to search filters');
    }

    return data;
  }
}; 