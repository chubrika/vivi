import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, getHeaders } from './config';

export interface CourierStats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  todayOrders: number;
  totalEarnings: number;
  pendingWithdrawal: boolean;
  totalDeliveries: number;
}

export interface CourierEarnings {
  totalEarnings: number;
  pendingWithdrawal: boolean;
  payoutHistory: Array<{
    amount: number;
    date: string;
    status: 'paid' | 'rejected';
  }>;
  deliveryHistory: Array<{
    _id: string;
    orderId: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }>;
  totalDeliveries: number;
}

export const courierService = {
  // Get courier statistics (includes earnings)
  getStats: async (): Promise<CourierStats> => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/courier/stats`, {
        method: 'GET',
        headers: getHeaders(true, token),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch courier stats');
      }

      const data = await response.json();
      console.log('Received courier stats:', data);
      return data;
    } catch (error) {
      console.error('Error fetching courier stats:', error);
      throw error;
    }
  },

  // Get courier earnings and delivery history
  getEarnings: async (): Promise<CourierEarnings> => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/courier/earnings`, {
        method: 'GET',
        headers: getHeaders(true, token),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch courier earnings');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching courier earnings:', error);
      throw error;
    }
  },

  // Request withdrawal
  requestWithdrawal: async (): Promise<{ message: string; pendingAmount: number }> => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/courier/withdraw`, {
        method: 'POST',
        headers: getHeaders(true, token),
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to request withdrawal');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      throw error;
    }
  }
}; 