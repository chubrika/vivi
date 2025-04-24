import { API_BASE_URL } from '../utils/api';
import { getToken } from '../utils/authContext';

export interface Address {
  _id?: string;
  id?: string;
  title: string;
  address: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

export const addressService = {
  async getAddresses(): Promise<Address[]> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/addresses`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch addresses');
    }

    return data;
  },

  async addAddress(addressData: Address): Promise<Address> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/addresses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(addressData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add address');
    }

    return data;
  },

  async updateAddress(id: string, addressData: Partial<Address>): Promise<Address> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/addresses/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(addressData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update address');
    }

    return data;
  },

  async deleteAddress(id: string): Promise<{ message: string }> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/addresses/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete address');
    }

    return data;
  },

  async setDefaultAddress(id: string): Promise<Address> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/addresses/${id}/set-default`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to set default address');
    }

    return data;
  },
}; 