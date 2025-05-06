'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '../../../utils/api';
import { Product } from '../../../types/product';

interface Seller {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  businessName: string;
  businessAddress: string;
  isActive: boolean;
}

export default function SellerDetailPage() {
  const params = useParams();
  const sellerId = params?.id as string;
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productsError, setProductsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeller = async () => {
      if (!sellerId) {
        setError('Seller ID is missing');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/sellers/public/${sellerId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Seller not found');
          }
          throw new Error('Failed to fetch seller details');
        }
        
        const data = await response.json();
        setSeller(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    const fetchProducts = async () => {
      if (!sellerId) {
        setProductsError('Seller ID is missing');
        setProductsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/products/seller/${sellerId}/public`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch seller products');
        }
        
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setProductsError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setProductsLoading(false);
      }
    };

    fetchSeller();
    fetchProducts();
  }, [sellerId]);

  if (loading) {
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
          href="/shops"
          className="text-purple-600 hover:text-purple-800 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Sellers
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{seller.businessName}</h1>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="text-gray-900">{seller.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                  <p className="text-gray-900">{seller.phoneNumber}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Address</h3>
                  <p className="text-gray-900">{seller.businessAddress}</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Business Owner</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p className="text-gray-900">{seller.firstName} {seller.lastName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seller's Products Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Products by {seller.businessName}</h2>
        
        {productsLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : productsError ? (
          <div className="text-red-500 text-center py-8">{productsError}</div>
        ) : products.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No products available from this seller.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link 
                href={`/products/${product._id}`} 
                key={product._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative aspect-square">
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-purple-600 font-medium">{product.price.toFixed(2)} ₾</p>
                  {product.category && (
                    <p className="text-sm text-gray-500 mt-1">{product.category?.name}</p>
                  )}
                  <div className="mt-2 flex items-center">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      product.isActive ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    <span className="text-xs text-gray-500">
                      {product.isActive ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 