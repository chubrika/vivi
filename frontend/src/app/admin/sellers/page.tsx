'use client';

import { useState, useEffect } from 'react';
import { sellerProfileService, SellerProfileWithUser } from '../../../services/sellerProfileService';
import { getToken } from '../../../utils/authContext';

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<SellerProfileWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'suspended'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchSellers();
  }, [filter]);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Always fetch all sellers, then filter client-side
      const data = await sellerProfileService.getAllSellers();
      
      // Filter by status
      const filtered = filter === 'all'
        ? data
        : data.filter(seller => seller.status === filter);
      
      setSellers(filtered);
    } catch (err) {
      console.error('Error fetching sellers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load sellers');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (sellerProfileId: string) => {
    if (!confirm('დარწმუნებული ხართ, რომ გსურთ გამყიდველის დამტკიცება?')) {
      return;
    }

    try {
      setActionLoading(sellerProfileId);
      await sellerProfileService.approveSeller(sellerProfileId);
      await fetchSellers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve seller');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (sellerProfileId: string) => {
    const reason = prompt('შეიყვანეთ უარყოფის მიზეზი (არასავალდებულო):');
    if (reason === null) return; // User cancelled

    if (!confirm('დარწმუნებული ხართ, რომ გსურთ გამყიდველის უარყოფა?')) {
      return;
    }

    try {
      setActionLoading(sellerProfileId);
      await sellerProfileService.rejectSeller(sellerProfileId, reason || undefined);
      await fetchSellers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject seller');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (sellerProfileId: string) => {
    const reason = prompt('შეიყვანეთ დაბლოკვის მიზეზი (არასავალდებულო):');
    if (reason === null) return; // User cancelled

    if (!confirm('დარწმუნებული ხართ, რომ გსურთ გამყიდველის დაბლოკვა?')) {
      return;
    }

    try {
      setActionLoading(sellerProfileId);
      await sellerProfileService.suspendSeller(sellerProfileId, reason || undefined);
      await fetchSellers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to suspend seller');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'suspended':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'დამტკიცებული';
      case 'pending':
        return 'მოლოდინში';
      case 'rejected':
        return 'უარყოფილი';
      case 'suspended':
        return 'დაბლოკილი';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">გამყიდველების მართვა</h1>
        
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ყველა
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'pending'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            მოლოდინში
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'approved'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            დამტკიცებული
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'rejected'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            უარყოფილი
          </button>
          <button
            onClick={() => setFilter('suspended')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'suspended'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            დაბლოკილი
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      )}

      {sellers.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">გამყიდველი ვერ მოიძებნა</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ელ-ფოსტა
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  მაღაზიის სახელი
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ტელეფონი
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  სტატუსი
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  თარიღი
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  მოქმედებები
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sellers.map((seller) => {
                const userId = typeof seller.userId === 'string' ? seller.userId : (seller.userId?._id ?? '');
                const userEmail = typeof seller.userId === 'string' ? '' : (seller.userId?.email ?? '');
                
                return (
                  <tr key={seller._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {userEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {seller.storeName || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {seller.phone || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(seller.status)}`}>
                        {getStatusLabel(seller.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(seller.createdAt).toLocaleDateString('ka-GE')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {seller.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(seller._id)}
                              disabled={actionLoading === seller._id}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            >
                              {actionLoading === seller._id ? '...' : 'დამტკიცება'}
                            </button>
                            <button
                              onClick={() => handleReject(seller._id)}
                              disabled={actionLoading === seller._id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              {actionLoading === seller._id ? '...' : 'უარყოფა'}
                            </button>
                          </>
                        )}
                        {seller.status === 'approved' && (
                          <button
                            onClick={() => handleSuspend(seller._id)}
                            disabled={actionLoading === seller._id}
                            className="text-orange-600 hover:text-orange-900 disabled:opacity-50"
                          >
                            {actionLoading === seller._id ? '...' : 'დაბლოკვა'}
                          </button>
                        )}
                        {seller.status === 'suspended' && (
                          <button
                            onClick={() => handleApprove(seller._id)}
                            disabled={actionLoading === seller._id}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            {actionLoading === seller._id ? '...' : 'განბლოკვა'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
