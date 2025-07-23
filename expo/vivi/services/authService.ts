import AsyncStorage from '@react-native-async-storage/async-storage';

// Use relative path for web proxy
const API_URL = '/api';

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
    id: string;
    name: string;
    email: string;
    isEmailVerified?: boolean;
  };
}

export interface SocialLoginData {
  provider: 'google' | 'facebook' | 'apple';
  token: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('Sending login request to:', `${API_URL}/auth/login`);
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
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
      
      // Store the token and user data
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      
      return data;
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
      
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      
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
