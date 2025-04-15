'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../utils/authContext';
import Modal from '../../../components/Modal';
import ProductForm from '../../../components/ProductForm';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  seller: {
    _id: string;
    name: string;
  };
  category: {
    _id: string;
    name: string;
  };
  images: string[];
  isActive: boolean;
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
}

interface Seller {
  _id: string;
  name: string;
}

interface Category {
  _id: string;
  name: string;
}

const ProductsPage = () => {
  const { token, isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductFormData | undefined>(undefined);

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
      const response = await fetch('/api/sellers', {
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

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
      fetchSellers();
      fetchCategories();
    }
  }, [isAuthenticated, token]);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setSelectedProduct({
        _id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        seller: product.seller._id,
        category: product.category._id,
        images: product.images,
        isActive: product.isActive
      });
    } else {
      setSelectedProduct(undefined);
    }
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
          onClick={() => handleOpenModal()}
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

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {products.length === 0 ? (
            <li className="px-4 py-4">No products found.</li>
          ) : (
            products.map((product) => (
              <li key={product._id} className="px-4 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {product.images && product.images.length > 0 && (
                      <div className="flex-shrink-0 h-16 w-16 mr-4">
                        <img
                          className="h-16 w-16 rounded-md object-cover"
                          src={product.images[0]}
                          alt={product.name}
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-medium text-gray-600">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.description}</p>
                      <div className="mt-1 flex items-center space-x-2">
                        <span className="text-sm font-medium">${product.price.toFixed(2)}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">მარაგში: {product.stock}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">მაღაზია: {product.seller.name}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">კატეგორია: {product.category.name}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleOpenModal(product)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedProduct ? 'Edit Product' : 'Add Product'}
      >
        <ProductForm
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
          product={selectedProduct}
          sellers={sellers}
          categories={categories}
        />
      </Modal>
    </div>
  );
};

export default ProductsPage; 