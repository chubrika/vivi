import { API_BASE_URL } from '../utils/api';

interface AuthCredentials {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: 'customer' | 'seller';
  businessName?: string;
  businessAddress?: string;
  phoneNumber?: string;
}

interface AuthResponse {
  token: string;
  user: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'customer' | 'seller' | 'admin';
    businessName?: string;
    businessAddress?: string;
    phoneNumber?: string;
  };
}

export const authService = {
  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  },

  async register(credentials: AuthCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    return data;
  },
}; 