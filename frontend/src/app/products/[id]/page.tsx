'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AddToCartButton from '../../../components/AddToCartButton';
import { api } from '../../../utils/api';
import { useAuth } from '../../../utils/authContext';
import { Product } from '../../../types/product';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const router = useRouter();
  const { user } = useAuth();
  const isSeller = user?.role === 'seller';

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/api/products/${params.id}`);
        setProduct(response.data);
      } catch (err) {
        setError('Failed to load product details');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Product not found'}</p>
          <button
            onClick={() => router.back()}
            className="text-purple-600 hover:text-purple-800"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back button */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => router.back()}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{product.name}</h1>
            
            {/* Image gallery */}
            <div className="mb-8">
              <div className="relative aspect-square rounded-lg overflow-hidden mb-4">
                <img
                  src={product.images[activeImageIndex] || 'https://via.placeholder.com/400'}
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
              </div>
              {product.images.length > 1 && (
                <div className="flex flex-wrap gap-4">
                  {product.images.map((image, index) => (
                    <div
                      key={index}
                      className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer w-20 h-20 ${index === activeImageIndex ? 'ring-2 ring-purple-500' : ''}`}
                      onClick={() => setActiveImageIndex(index)}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product details */}
            <div className="space-y-6">
              <div>
                <p className="text-3xl font-semibold text-purple-600">
                  ${product.price.toFixed(2)}
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">Stock</h2>
                <p className="mt-1 text-gray-600">{product.stock} units available</p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">Category</h2>
                <p className="mt-1 text-gray-600">{product.category?.name}</p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">Description</h2>
                <div 
                  className="mt-2 text-gray-600"
                  dangerouslySetInnerHTML={{ __html: product.description }} 
                />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">Seller</h2>
                <p className="mt-1 text-gray-600">{product.seller.name}</p>
              </div>

              <div className="pt-6">
                {!isSeller ? (
                  <AddToCartButton product={product} />
                ) : (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          გამყიდველს არ შეუძლია პროდუქტის ყიდვა ან კალათაში დამატება
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 