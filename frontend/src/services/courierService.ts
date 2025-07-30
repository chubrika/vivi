import { api } from '../utils/api';

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

export interface PendingWithdrawal {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  totalEarnings: number;
  pendingWithdrawal: boolean;
}

export const courierService = {
  // Get courier earnings and delivery history
  getEarnings: async (token: string): Promise<CourierEarnings> => {
    const response = await api.get('/api/courier/earnings', token);
    return response;
  },

  // Request withdrawal
  requestWithdrawal: async (token: string): Promise<{ message: string; pendingAmount: number }> => {
    const response = await api.post('/api/courier/withdraw', {}, token);
    return response;
  },

  // Get courier statistics (includes earnings)
  getStats: async (token: string): Promise<CourierStats> => {
    const response = await api.get('/api/courier/stats', token);
    return response;
  },

  // Admin: Get all pending withdrawals
  getPendingWithdrawals: async (token: string): Promise<PendingWithdrawal[]> => {
    const response = await api.get('/api/courier/pending-withdrawals', token);
    return response;
  },

  // Admin: Process courier payout
  processPayout: async (courierId: string, status: 'paid' | 'rejected', token: string): Promise<{ message: string; payoutRecord: any }> => {
    const response = await api.post(`/api/courier/payout/${courierId}`, { status }, token);
    return response;
  }
}; 