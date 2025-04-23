import { API_BASE_URL } from '../utils/api';
import { getToken } from '../utils/authContext';

export interface Seller {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  isActive: boolean;
}

export interface CreateSellerData {
  name: string;
  email: string;
  phone: string;
  address: string;
  description: string;
}

export interface UpdateSellerData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  description?: string;
  isActive?: boolean;
}

export const sellersService = {
  async getAllSellers(): Promise<Seller[]> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/sellers`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch sellers');
    }

    return data;
  },

  async getSellerById(id: string): Promise<Seller> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/sellers/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch seller details');
    }

    return data;
  },

  async createSeller(sellerData: CreateSellerData): Promise<Seller> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/sellers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sellerData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create seller');
    }

    return data;
  },

  async updateSeller(id: string, sellerData: UpdateSellerData): Promise<Seller> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/sellers/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sellerData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update seller');
    }

    return data;
  },

  async deleteSeller(id: string): Promise<{ message: string }> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/sellers/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete seller');
    }

    return data;
  },

  async toggleSellerStatus(id: string): Promise<Seller> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/sellers/${id}/toggle-status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to toggle seller status');
    }

    return data;
  }
}; 