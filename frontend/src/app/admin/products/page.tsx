'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../utils/api';
import { useAuth, User } from '../../../utils/authContext';
import Modal from '../../../components/Modal';
import ProductForm from '../../../components/ProductForm';
import ProductsGrid from '../../../components/ProductsGrid';
import { Product, FeatureGroup } from '../../../types/product';
import { categoriesService, Category } from '../../../services/categoriesService';
import toast, { Toaster } from 'react-hot-toast';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';

interface FeatureValue {
  type: number;
  featureValue: string;
}

interface Feature {
  featureId: number;
  featureCaption: string;
  featureValues: FeatureValue[];
}

interface Seller {
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

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  isActive: boolean;
  productFeatureValues?: FeatureGroup[];
}

export default function AdminProductsPage() {
  const router = useRouter();
  const { isAuthenticated, token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    images: [],
    isActive: true,
    productFeatureValues: []
  });

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchProducts();
      fetchSellers();
      fetchCategories();
      fetchFilters();
    }
  }, [isAuthenticated, token]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError('Failed to fetch products');
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
      let data = await response.json();
      data = data.filter((seller: User) => seller.role === 'seller');
      setSellers(data);
    } catch (err) {
      setError('Failed to fetch sellers');
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoriesService.getAllCategories();
      setCategories(data);
    } catch (err) {
      setError('Failed to fetch categories');
    }
  };

  const fetchFilters = async () => {
    try {
      const response = await fetch('/api/filters', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setFilters(data);
    } catch (err) {
      setError('Failed to fetch filters');
    }
  };

  const handleOpenModal = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      images: product.images,
      isActive: product.isActive,
      productFeatureValues: product.productFeatureValues || []
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

  const handleDelete = async (productId: string) => {
    try {
      await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product');
      setError('Failed to delete product');
    }
  };

  const toggleProductExpansion = (productId: string) => {
    setExpandedProductId(expandedProductId === productId ? null : productId);
  };

  if (!isAuthenticated || !token) {
    return <div className="p-4">Please log in to access this page.</div>;
  }

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl text-gray-600 font-bold">პროდუქტები</h1>
        <button
          onClick={handleAddNewProduct}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add New Product
        </button>
      </div>

      <ProductsGrid
        products={products}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
        categories={categories}
        filters={filters}
      />

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} size="3xl">
          <ProductForm
            product={selectedProduct}
            categories={categories}
            sellers={sellers}
            onClose={handleCloseModal}
            onSuccess={() => {
              fetchProducts();
              if (selectedProduct) {
                toast.success('Product updated successfully');
              } else {
                toast.success('New product created successfully');
              }
            }}
          />
        </Modal>
      )}
    </div>
  );
} 