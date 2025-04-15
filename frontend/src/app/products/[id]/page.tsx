'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../utils/authContext';
import AddToCartButton from '../../../components/AddToCartButton';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  category: {
    _id: string;
    name: string;
  };
  seller: {
    _id: string;
    name: string;
  };
  isActive: boolean;
}

export default function ProductDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8 bg-white">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>{error || 'Product not found'}</p>
        </div>
        <Link href="/" className="mt-4 inline-block text-purple-600 hover:underline">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-white">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          {/* Product Images */}
          <div className="md:w-1/2 p-6">
            {product.images && product.images.length > 0 ? (
              <div>
                <div className="mb-4 h-80 overflow-hidden rounded-lg">
                  <img 
                    src={product.images[activeImageIndex]} 
                    alt={product.name} 
                    className="w-full h-full object-contain"
                  />
                </div>
                {product.images.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`w-20 h-20 rounded-md overflow-hidden border-2 ${
                          activeImageIndex === index ? 'border-purple-600' : 'border-gray-200'
                        }`}
                      >
                        <img 
                          src={image} 
                          alt={`${product.name} - ${index + 1}`} 
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-80 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="md:w-1/2 p-6">
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="mb-4">
              <span className="text-2xl font-bold text-purple-600">${product.price.toFixed(2)}</span>
            </div>
            <div className="mb-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {product.isActive ? 'In Stock' : 'Out of Stock'}
              </span>
              <span className="ml-2 text-gray-500">Stock: {product.stock}</span>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-1">Category</h3>
              <p className="text-gray-600">{product.category.name}</p>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-1">Seller</h3>
              <p className="text-gray-600">{product.seller.name}</p>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-1">Description</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>
            <AddToCartButton product={product} className="w-full" />
            <div className="flex space-x-4">
              <Link 
                href="/products" 
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 transition"
              >
                Back to Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 