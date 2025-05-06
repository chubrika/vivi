import React, { useState, useEffect } from 'react';
import { Category } from '../types/category';
import { useAuth } from '../utils/authContext';

interface CategoryMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const CategoryMenu: React.FC<CategoryMenuProps> = ({ isOpen, onClose }) => {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen, token]);

  const renderCategoryBox = (category: Category) => {
    return (
      <div key={category._id} className="bg-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{category.name}</h3>
        {category.description && (
          <p className="text-gray-600 text-sm mb-3">{category.description}</p>
        )}
        {category.children && category.children.length > 0 && (
          <div className="mt-2 space-y-2">
            {category.children.map(child => (
              <div key={child._id} className="text-sm text-gray-600 hover:text-gray-900">
                {child.name}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-[80px] inset-0 z-50 bg-white border-top-1 border-gray-200">
      <div className="max-w px-4 sm:px-6 lg:px-8 py-8 bg-white">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">ყველა კატეგორია</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : error ? (
          <div className="text-red-500 text-center py-8">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories
              .filter(category => !category.parentId)
              .map(category => renderCategoryBox(category))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryMenu; 