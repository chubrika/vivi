'use client';

import { useState, useEffect } from 'react';
import { useAuth, getToken } from '../../../utils/authContext';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { sellersService, Seller } from '../../../services/sellersService';

export default function SellerDetailPage() {
  const { isAuthenticated, refreshToken } = useAuth();
  const params = useParams();
  const sellerId = params?.id as string;
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const fetchSeller = async () => {
      if (!sellerId) {
        setError('Seller ID is missing');
        setLoading(false);
        return;
      }

      try {
        // Get a validated token
        const validToken = getToken();
        if (!validToken) {
          console.error('Invalid token detected in seller detail page');
          setError('Authentication error. Please log in again.');
          setLoading(false);
          return;
        }
        
        try {
          // Use the sellersService to fetch seller details
          const sellerData = await sellersService.getSellerById(sellerId);
          setSeller(sellerData);
        } catch (fetchError) {
          // If we get a 401 error, try to refresh the token
          if (fetchError instanceof Error && fetchError.message.includes('401') && !isRefreshing) {
            setIsRefreshing(true);
            const refreshed = await refreshToken();
            setIsRefreshing(false);
            
            if (refreshed) {
              // Retry the fetch with the new token
              const sellerData = await sellersService.getSellerById(sellerId);
              setSeller(sellerData);
              return;
            } else {
              // If refresh failed, show error
              setError('Authentication error. Please log in again.');
              setLoading(false);
              return;
            }
          }
          
          // For other errors, throw them to be caught by the outer catch
          throw fetchError;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && sellerId) {
      fetchSeller();
    } else {
      setLoading(false);
      setError('Please log in to view seller details');
    }
  }, [isAuthenticated, refreshToken, sellerId, isRefreshing]);

  if (loading || isRefreshing) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Seller not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          href="/sellers"
          className="text-purple-600 hover:text-purple-800 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          უკან
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{seller.name}</h1>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                seller.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {seller.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          {seller.description && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">შესახებ</h2>
              <p className="text-gray-600">{seller.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900">საკონტაქტო ინფორმაცია</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">ელ-ფოსტა</h3>
                  <p className="text-gray-900">{seller.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">ტელეფონი</h3>
                  <p className="text-gray-900">{seller.phone}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">მისამართი</h3>
                  <p className="text-gray-900">{seller.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 