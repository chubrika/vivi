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

// Fallback data for when API calls fail
const fallbackStats: CourierStats = {
  totalOrders: 0,
  pendingOrders: 0,
  processingOrders: 0,
  shippedOrders: 0,
  deliveredOrders: 0,
  cancelledOrders: 0,
  todayOrders: 0,
  totalEarnings: 0,
  pendingWithdrawal: false,
  totalDeliveries: 0,
};

const fallbackEarnings: CourierEarnings = {
  totalEarnings: 0,
  pendingWithdrawal: false,
  payoutHistory: [],
  deliveryHistory: [],
  totalDeliveries: 0,
};

// Helper function to safely get token
const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('authToken');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

export const courierService = {
  // Get courier statistics (includes earnings)
  getStats: async (): Promise<CourierStats> => {
    try {
      const token = await getAuthToken();
      if (!token) {
        console.log('No authentication token found, returning fallback stats');
        return fallbackStats;
      }

      console.log('Fetching courier stats from:', `${API_URL}/courier/stats`);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const fetchPromise = fetch(`${API_URL}/courier/stats`, {
        method: 'GET',
        headers: getHeaders(true, token),
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

      if (!response.ok) {
        console.error('Courier stats API error:', response.status, response.statusText);
        return fallbackStats;
      }

      const data = await response.json();
      console.log('Received courier stats:', data);
      return data;
    } catch (error) {
      console.error('Error fetching courier stats:', error);
      // Return fallback data instead of throwing error
      return fallbackStats;
    }
  },

  // Get courier earnings and delivery history
  getEarnings: async (): Promise<CourierEarnings> => {
    try {
      const token = await getAuthToken();
      if (!token) {
        console.log('No authentication token found, returning fallback earnings');
        return fallbackEarnings;
      }

      console.log('Fetching courier earnings from:', `${API_URL}/courier/earnings`);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const fetchPromise = fetch(`${API_URL}/courier/earnings`, {
        method: 'GET',
        headers: getHeaders(true, token),
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

      if (!response.ok) {
        console.error('Courier earnings API error:', response.status, response.statusText);
        return fallbackEarnings;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching courier earnings:', error);
      // Return fallback data instead of throwing error
      return fallbackEarnings;
    }
  },

  // Request withdrawal
  requestWithdrawal: async (): Promise<{ message: string; pendingAmount: number }> => {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Requesting withdrawal from:', `${API_URL}/courier/withdraw`);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const fetchPromise = fetch(`${API_URL}/courier/withdraw`, {
        method: 'POST',
        headers: getHeaders(true, token),
        body: JSON.stringify({}),
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

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