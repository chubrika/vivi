'use client';

import { useState, useEffect } from 'react';
import { courierService, PendingWithdrawal } from '../../../services/courierService';
import { useAuth } from '../../../utils/authContext';

export default function AdminCouriersPage() {
  const { token } = useAuth();
  const [pendingWithdrawals, setPendingWithdrawals] = useState<PendingWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      fetchPendingWithdrawals();
    }
  }, [token]);

  const fetchPendingWithdrawals = async () => {
    try {
      const data = await courierService.getPendingWithdrawals(token!);
      setPendingWithdrawals(data);
    } catch (err) {
      console.error('Error fetching pending withdrawals:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch pending withdrawals');
    } finally {
      setLoading(false);
    }
  };

  const handlePayout = async (courierId: string, status: 'paid' | 'rejected') => {
    try {
      await courierService.processPayout(courierId, status, token!);
      alert(`Payout ${status} successfully!`);
      // Refresh the list
      await fetchPendingWithdrawals();
    } catch (err) {
      console.error('Error processing payout:', err);
      setError(err instanceof Error ? err.message : 'Failed to process payout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Courier Management</h1>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        )}

        {/* Pending Withdrawals */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Pending Withdrawals</h2>
          
          {pendingWithdrawals.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No pending withdrawal requests.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Courier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingWithdrawals.map((courier) => (
                    <tr key={courier._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {courier.firstName} {courier.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{courier.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {courier.totalEarnings} ₾
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handlePayout(courier._id, 'paid')}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handlePayout(courier._id, 'rejected')}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-blue-600">Pending Requests</div>
              <div className="text-2xl font-bold text-blue-900">{pendingWithdrawals.length}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-green-600">Total Amount Pending</div>
              <div className="text-2xl font-bold text-green-900">
                {pendingWithdrawals.reduce((sum, courier) => sum + courier.totalEarnings, 0)} ₾
              </div>
            </div>
            <div className="bg-sky-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-sky-600">Average Request</div>
              <div className="text-2xl font-bold text-sky-900">
                {pendingWithdrawals.length > 0 
                  ? Math.round(pendingWithdrawals.reduce((sum, courier) => sum + courier.totalEarnings, 0) / pendingWithdrawals.length)
                  : 0} ₾
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 