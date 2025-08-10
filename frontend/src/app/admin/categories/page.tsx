'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../utils/authContext';
import Modal from '../../../components/Modal';
import HierarchicalCategoryForm from '../../../components/HierarchicalCategoryForm';
import { categoriesService, Category } from '../../../services/categoriesService';

const CategoriesPage = () => {
  const { token, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const fetchCategories = async () => {
    try {
      const data = await categoriesService.getAllCategories();

      // Automatically expand all categories with children
      const categoriesWithChildren = new Set<string>();
      const findCategoriesWithChildren = (categories: Category[]) => {
        categories.forEach(category => {
          if (category.children && category.children.length > 0) {
            categoriesWithChildren.add(category._id);
            findCategoriesWithChildren(category.children);
          }
        });
      };
      findCategoriesWithChildren(data);
      setCategories(data);
      setExpandedCategories(categoriesWithChildren);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
    }
  }, [isAuthenticated, token]);

  const handleOpenModal = (category?: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedCategory(undefined);
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    fetchCategories();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      await categoriesService.deleteCategory(id);
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const renderCategoryTree = (category: Category, level: number = 0) => {
    const isExpanded = expandedCategories.has(category._id);
    
    return (
      <div key={category._id} className="ml-4">
        <div className="flex items-center py-2 hover:bg-gray-100 rounded">
          <div className="flex-1 flex items-center">
            {category.hasChildren && (
              <button
                onClick={() => toggleCategory(category._id)}
                className="w-4 h-4 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-transform duration-200"
                style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
            {!category.hasChildren && <span className="w-4 text-gray-400">•</span>}
            <span className="ml-2 text-gray-600">{category.name}</span>
            {!category.isActive && (
              <span className="ml-2 text-xs text-red-500">(Inactive)</span>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleOpenModal(category)}
              className="text-indigo-600 hover:text-indigo-900"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(category._id)}
              className="text-red-600 hover:text-red-900"
            >
              Delete
            </button>
            <button
              onClick={() => handleOpenModal(undefined)}
              className="text-green-600 hover:text-green-900"
            >
              Add Child
            </button>
          </div>
        </div>
        {category.hasChildren && (
          <div 
            className={`border-l-2 border-gray-200 overflow-hidden transition-all duration-300 ease-in-out`}
            style={{
              maxHeight: isExpanded ? '1000px' : '0',
              opacity: isExpanded ? 1 : 0
            }}
          >
            <div className="pl-4">
              {category.children?.map(child => renderCategoryTree(child, level + 1))}
            </div>
          </div>
        )}
      </div>
    );
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
        <h1 className="text-2xl font-bold text-gray-600">კატეგორიები</h1>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Add Category
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        {categories
          .filter(category => !category.parentId)
          .map(category => renderCategoryTree(category))}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <HierarchicalCategoryForm
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
          category={selectedCategory}
          parentCategories={categories}
        />
      </Modal>
    </div>
  );
};

export default CategoriesPage; 