import { API_BASE_URL } from '../utils/api';
import { getToken } from '../utils/authContext';
import { api } from '../utils/api';
import { fetchApi } from '../utils/api';
import type { User } from '../types/user';

interface AuthCredentials {
  email: string;
  password: string;
  name?: string;
}

interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phoneNumber?: string;
  personalNumber?: string;
}

export const userService = {
  async getCurrentUser(): Promise<User> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user profile');
    }

    return { ...data, _id: data._id || data.id } as User;
  },

  async updateProfile(data: UpdateUserData): Promise<User> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    return fetchApi('/api/auth/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, token);
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/users/change-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to change password');
    }

    return data;
  },
}; 