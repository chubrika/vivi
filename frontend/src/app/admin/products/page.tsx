'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../utils/authContext';
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
  seller: {
    _id: string;
    firstName?: string;
    lastName?: string;
    businessName?: string;
    email: string;
  };
  category: {
    _id: string;
    name: string;
  };
  images: string[];
  isActive: boolean;
  productFeatureValues?: FeatureGroup[];
  filters?: {
    _id: string;
    name: string;
    description: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

interface ProductFormData {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  seller: string;
  category: string;
  images: string[];
  isActive: boolean;
  productFeatureValues?: FeatureGroup[];
  filters?: string[];
}

interface Category {
  _id: string;
  name: string;
}

interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  email: string;
  role: string;
}

interface Filter {
  _id: string;
  name: string;
  description: string;
}

const ProductsPage = () => {
  const { token, isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductFormData | undefined>(undefined);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products', {
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
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchSellers = async () => {
    try {
      const response = await fetch('/api/admin/users?role=seller', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch sellers');
      }
      
      const data = await response.json();
      setSellers(data);
    } catch (err) {
      console.error('Error fetching sellers:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories', {
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
    }
  };

  const fetchFilters = async () => {
    try {
      const response = await fetch('/api/filters', {
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
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
      fetchSellers();
      fetchCategories();
      fetchFilters();
    }
  }, [isAuthenticated, token]);

  const handleOpenModal = (product: Product) => {
    setSelectedProduct({
      _id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      seller: product.seller._id,
      category: product.category._id,
      images: product.images,
      isActive: product.isActive,
      productFeatureValues: product.productFeatureValues,
      filters: product.filters?.map(filter => filter._id) || []
    });
    setIsModalOpen(true);
  };

  const handleAddNewProduct = () => {
    setSelectedProduct(undefined);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedProduct(undefined);
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      
      fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const toggleProductExpansion = (productId: string) => {
    setExpandedProductId(expandedProductId === productId ? null : productId);
  };

  if (!isAuthenticated) {
    return <div className="p-4">Please log in to access this page.</div>;
  }

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-600">პროდუქტები</h1>
        <button
          onClick={handleAddNewProduct}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          პროდუქტის დამატება
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <ProductsGrid 
        products={products}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
        showFeatures={true}
        expandedProductId={expandedProductId}
        onToggleExpansion={toggleProductExpansion}
        viewMode="list"
        categories={categories}
        filters={filters}
        showFilters={true}
      />

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedProduct ? 'Edit Product' : 'Add Product'}>
          <ProductForm
            product={selectedProduct}
            categories={categories}
            sellers={sellers}
            onClose={handleCloseModal}
            onSuccess={handleSuccess}
          />
        </Modal>
      )}
    </div>
  );
};

export default ProductsPage; 