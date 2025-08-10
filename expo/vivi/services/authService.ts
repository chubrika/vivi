import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, getHeaders } from './config';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id?: string;
    _id?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    role?: string;
    isEmailVerified?: boolean;
  };
  status?: number;
}

export interface SocialLoginData {
  provider: 'google' | 'facebook' | 'apple';
  token: string;
}

// Helper function to safely handle AsyncStorage operations
const safeAsyncStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Error reading from AsyncStorage (${key}):`, error);
      return null;
    }
  },
  
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error writing to AsyncStorage (${key}):`, error);
    }
  },
  
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from AsyncStorage (${key}):`, error);
    }
  }
};

export const authService = {
  async getCurrentUser(): Promise<AuthResponse['user'] | null> {
    try {
      const token = await safeAsyncStorage.getItem('authToken');
      const userData = await safeAsyncStorage.getItem('userData');
      
      if (!token || !userData) {
        console.log('No token or user data found');
        return null;
      }
      
      // For now, just use cached data to prevent network issues
      try {
        const parsedUserData = JSON.parse(userData);
        console.log('Using cached user data:', parsedUserData);
        return parsedUserData;
      } catch (parseError) {
        console.error('Error parsing cached user data:', parseError);
        // Clear corrupted data
        await safeAsyncStorage.removeItem('authToken');
        await safeAsyncStorage.removeItem('userData');
        return null;
      }
      
      // TODO: Re-enable server validation when network issues are resolved
      /*
      console.log('Validating token with server...');
      // Optionally validate token with server
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'GET',
        headers: getHeaders(true, token),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Token validation successful:', data);
        return data.user;
      } else {
        console.log('Token validation failed, clearing storage');
        // Token is invalid, clear storage
        await safeAsyncStorage.removeItem('authToken');
        await safeAsyncStorage.removeItem('userData');
        return null;
      }
      */
    } catch (error) {
      console.error('Error getting current user:', error);
      // On network error, try to use cached user data
      try {
        const userData = await safeAsyncStorage.getItem('userData');
        if (userData) {
          console.log('Using cached user data due to network error');
          return JSON.parse(userData);
        }
      } catch (parseError) {
        console.error('Error parsing cached user data:', parseError);
      }
      return null;
    }
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const responseData = await response.json();
      const { token, user } = responseData;
      
      // Format user data to match frontend expectations
      const formattedUser = {
        id: user._id || user.id,
        name: user.firstName || user.name || 'User',
        email: user.email,
        role: user.role || 'user'
      };
      
      // Store the token and user data
      await safeAsyncStorage.setItem('authToken', token);
      await safeAsyncStorage.setItem('userData', JSON.stringify(formattedUser));
      
      return {
        token,
        user: formattedUser
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      const token = await safeAsyncStorage.getItem('authToken');
      if (token) {
        // Optionally call logout endpoint
        try {
          await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: getHeaders(true, token),
          });
        } catch (networkError) {
          console.error('Network error during logout:', networkError);
          // Continue with local logout even if network fails
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      await safeAsyncStorage.removeItem('authToken');
      await safeAsyncStorage.removeItem('userData');
    }
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('Sending login request to:', `${API_URL}/auth/login`);
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(credentials),
      });

      // Log response details for debugging
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Get the response text first to check if it's HTML
      const responseText = await response.text();
      console.log('Response text:', responseText);

      // Check if the response is HTML
      if (responseText.includes('<!DOCTYPE html>') || responseText.includes('<html')) {
        console.error('Received HTML instead of JSON:', responseText);
        throw new Error('Server returned HTML instead of JSON. Please check your backend configuration.');
      }

      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error('Failed to parse response as JSON:', error);
        throw new Error('Invalid JSON response from server');
      }

      // First check if the response is ok
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      // Validate the response data
      if (!data || !data.token || !data.user) {
        console.error('Invalid response data:', data);
        throw new Error('Invalid response format from server');
      }

      const { token, user } = data;
      
      // Format user data to match frontend expectations
      const formattedUser = {
        id: user._id || user.id,
        name: user.firstName || user.name || 'User',
        email: user.email,
        role: user.role || 'user'
      };
      
      // Store the token and user data
      await safeAsyncStorage.setItem('authToken', token);
      await safeAsyncStorage.setItem('userData', JSON.stringify(formattedUser));
      
      return {
        token,
        user: formattedUser,
        status: response.status
      };
    } catch (error) {
      console.error('Login error details:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Login failed. Please check your credentials.');
    }
  },

  async socialLogin(data: SocialLoginData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/social-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Social login failed');
      }

      const responseData = await response.json();
      const { token, user } = responseData;
      
      await safeAsyncStorage.setItem('authToken', token);
      await safeAsyncStorage.setItem('userData', JSON.stringify(user));
      
      return responseData;
    } catch (error) {
      throw new Error('Social login failed. Please try again.');
    }
  },

  async requestPasswordReset(email: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to request password reset');
      }
    } catch (error) {
      throw new Error('Failed to request password reset. Please try again.');
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset password');
      }
    } catch (error) {
      throw new Error('Failed to reset password. Please try again.');
    }
  }
};
