import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/authContext';
import { Category, CreateCategoryData, UpdateCategoryData } from '../types/category';

interface HierarchicalCategoryFormProps {
  onClose: () => void;
  onSuccess: () => void;
  category?: Category;
  parentCategories: Category[];
}

const HierarchicalCategoryForm: React.FC<HierarchicalCategoryFormProps> = ({
  onClose,
  onSuccess,
  category,
  parentCategories
}) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState<CreateCategoryData>({
    name: '',
    description: '',
    isActive: true
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description,
        parentId: category.parentId,
        isActive: category.isActive
      });
    }
  }, [category]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const url = category 
        ? `/api/categories/${category._id}` 
        : '/api/categories';
      
      const method = category ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save category');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCategoryOptions = (categories: Category[], level: number = 0) => {
    return categories.map(category => (
      <React.Fragment key={category._id}>
        <option 
          value={category._id}
          disabled={category._id === formData.parentId}
          className={level > 0 ? 'pl-4' : ''}
        >
          {'\u00A0'.repeat(level * 2)}{category.name}
        </option>
        {category.children && renderCategoryOptions(category.children, level + 1)}
      </React.Fragment>
    ));
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg">
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-2 bg-red-50 text-red-600 text-sm rounded">
              {error}
            </div>
          )}

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Category Name"
            className="w-full px-3 py-2 border-b border-gray-300 focus:border-purple-500 focus:outline-none text-gray-600"
          />

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full px-3 py-2 border-b border-gray-300 focus:border-purple-500 focus:outline-none text-gray-600"
          />

          <select
            name="parentId"
            value={formData.parentId || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border-b border-gray-300 focus:border-purple-500 focus:outline-none text-gray-600"
          >
            <option value="">Select Parent Category</option>
            {renderCategoryOptions(parentCategories)}
          </select>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="text-sm text-gray-600">
              Active
            </label>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm text-white bg-purple-600 rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : category ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HierarchicalCategoryForm; 
