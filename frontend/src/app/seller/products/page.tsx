'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../utils/authContext';
import { API_BASE_URL } from '../../../utils/api';
import Modal from '../../../components/Modal';
import ProductForm from '../../../components/ProductForm';
import ProductsGrid from '../../../components/ProductsGrid';

interface FeatureValue {
  type: number;
  featureValue: string;
}

interface Feature {
  featureId: number;
  featureCaption: string;
  featureValues: FeatureValue[];
}

interface FeatureGroup {
  featureGroupId: number;
  featureGroupCaption: string;
  features: Feature[];
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  seller: string | {
    _id: string;
    firstName?: string;
    lastName?: string;
    businessName?: string;
    email: string;
  };
  category: string | { _id: string; name: string };
  images: string[];
  isActive: boolean;
  productFeatureValues?: FeatureGroup[];
  filters?: {
    _id: string;
    name: string;
    description: string;
  }[];
  createdAt: string;
  updatedAt?: string;
}

interface Category {
  _id: string;
  name: string;
}

interface Filter {
  _id: string;
  name: string;
  description: string;
}

interface Seller {
  _id: string;
  name: string;
}

export default function SellerProducts() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchFilters();
  }, []);

  const fetchProducts = async () => {
    try {
      // Use the productsService to get products by seller ID
      const response = await fetch(`${API_BASE_URL}/api/products?seller=${user?._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const fetchFilters = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/filters`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch filters');
      }

      const data = await response.json();
      setFilters(data);
    } catch (err) {
      console.error('Error fetching filters:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleToggleStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/seller/products/${productId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update product status');
      }

      // Refresh products list
      fetchProducts();
    } catch (err) {
      console.error('Error updating product status:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/seller/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      // Refresh products list
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleOpenModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    console.log('Current user ID:', user?._id);
  };

  const handleAddNewProduct = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    fetchProducts();
    handleCloseModal();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <button
            onClick={handleAddNewProduct}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Add New Product
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        )}

        <ProductsGrid 
          products={products}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          viewMode="table"
          categories={categories}
          filters={filters}
          showFilters={true}
        />
      </div>

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedProduct ? 'პროდუქტის რედაქტირება' : 'პროდუქტის დამატება'}>
          <ProductForm
            product={selectedProduct || undefined}
            categories={categories}
            sellers={[{ 
              _id: user?._id || '', 
              firstName: user?.firstName || '',
              lastName: user?.lastName || '',
              businessName: user?.businessName || '',
              email: user?.email || '',
              role: user?.role || 'seller'
            }]}
            onClose={handleCloseModal}
            onSuccess={handleSuccess}
            isSellerContext={true}
          />
        </Modal>
      )}
    </div>
  );
} 