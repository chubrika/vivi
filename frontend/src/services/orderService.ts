import { API_BASE_URL } from '../utils/api';
import { getToken } from '../utils/authContext';

export interface OrderItem {
  _id: string;
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
  user: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export const orderService = {
  /**
   * Get all orders for the current user
   * @returns Promise<Order[]> Array of orders
   */
  async getUserOrders(): Promise<Order[]> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch orders');
    }

    return data;
  },

  /**
   * Get a specific order by ID
   * @param orderId Order ID
   * @returns Promise<Order> Order object
   */
  async getOrderById(orderId: string): Promise<Order> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch order');
    }

    return data;
  }
}; 