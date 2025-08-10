import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, getHeaders } from './config';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  images: string[];
  sellerId: string;
}

export interface Order {
  _id: string;
  orderId: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  createdAt: string;
  courier?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface OrderFilters {
  orderId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const orderService = {
  async getOrders(filters: OrderFilters = {}): Promise<OrdersResponse> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const queryParams = new URLSearchParams({
        page: (filters.page || 1).toString(),
        limit: (filters.limit || 10).toString(),
        ...(filters.orderId && { orderId: filters.orderId }),
        ...(filters.status && { status: filters.status }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      });

      console.log('Fetching orders with params:', queryParams.toString());
      
      const response = await fetch(`${API_URL}/courier/orders?${queryParams}`, {
        method: 'GET',
        headers: getHeaders(true, token),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || 'Failed to fetch orders');
      }

      const data = await response.json();
      console.log('Received orders data:', data);
      
      return {
        orders: data.orders || [],
        pagination: data.pagination || {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0
        }
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/courier/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: getHeaders(true, token),
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || 'Failed to update order status');
      }

      console.log('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  async getOrderDetails(orderId: string): Promise<Order> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/courier/orders/${orderId}`, {
        method: 'GET',
        headers: getHeaders(true, token),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || 'Failed to fetch order details');
      }

      const data = await response.json();
      return data.order || data;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  }
}; 