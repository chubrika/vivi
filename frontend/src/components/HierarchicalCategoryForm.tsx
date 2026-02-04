import React, { useState, useEffect } from 'react';
import * as FaIcons from 'react-icons/fa';
import { useAuth } from '../utils/authContext';
import { categoriesService, Category, CreateCategoryData, UpdateCategoryData } from '../services/categoriesService';

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
    slug: '',
    isActive: true,
    icon: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [iconSearch, setIconSearch] = useState('');

  const icons = Object.keys(FaIcons).filter(name =>
    name.toLowerCase().includes(iconSearch.toLowerCase())
  );

  // Sync form when opening edit (category set) or reset when opening add (category undefined)
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description ?? '',
        slug: category.slug,
        parentId: category.parentId,
        isActive: category.isActive,
        icon: category.icon ?? ''
      });
      setIconSearch(''); // show full grid so selected icon is visible
    } else {
      setFormData({
        name: '',
        description: '',
        slug: '',
        isActive: true,
        icon: ''
      });
      setIconSearch('');
    }
  }, [category?._id, category?.name, category?.slug, category?.icon]);

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
      if (category) {
        await categoriesService.updateCategory(category._id, formData);
      } else {
        await categoriesService.createCategory(formData);
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
            className="w-full px-3 py-2 border-b border-gray-300 focus:border-sky-500 focus:outline-none text-gray-600"
          />

          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            required
            placeholder="Category Slug (e.g., electronics)"
            className="w-full px-3 py-2 border-b border-gray-300 focus:border-sky-500 focus:outline-none text-gray-600"
          />

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full px-3 py-2 border-b border-gray-300 focus:border-sky-500 focus:outline-none text-gray-600"
          />

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Category icon</label>
            <input
              type="text"
              value={iconSearch}
              onChange={(e) => setIconSearch(e.target.value)}
              placeholder="Search icons..."
              className="w-full px-3 py-2 mb-2 border border-gray-200 rounded-md focus:border-sky-500 focus:outline-none text-gray-600 text-sm"
            />
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-md bg-gray-50">
              {icons.map((iconName) => {
                const IconComponent = (FaIcons as Record<string, React.ComponentType<{ className?: string }>>)[iconName];
                const isSelected = formData.icon === iconName;
                if (!IconComponent) return null;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, icon: iconName }))}
                    className={`p-2 rounded-md flex items-center justify-center text-xl transition-colors ${
                      isSelected
                        ? 'bg-sky-600 text-white ring-2 ring-sky-400'
                        : 'bg-white text-gray-600 hover:bg-sky-100 hover:text-sky-700 border border-gray-200'
                    }`}
                    title={iconName}
                  >
                    <IconComponent className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
            {formData.icon && (
              <p className="mt-1 text-xs text-gray-500">Selected: {formData.icon}</p>
            )}
          </div>

          <select
            name="parentId"
            value={formData.parentId || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border-b border-gray-300 focus:border-sky-500 focus:outline-none text-gray-600"
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
              className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
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
              className="px-4 py-2 text-sm text-white bg-sky-600 rounded hover:bg-sky-700 disabled:opacity-50"
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
