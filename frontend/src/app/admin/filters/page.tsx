'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../utils/authContext';
import Modal from '../../../components/Modal';
import { API_BASE_URL } from '../../../utils/api';
import { filtersService, Filter, CreateFilterData, UpdateFilterData } from '../../../services/filtersService';
import { categoriesService, Category } from '../../../services/categoriesService';

type FilterType = 'select' | 'range' | 'color' | 'boolean';

interface FormData {
  name: string;
  slug: string;
  description: string;
  category: string;
  type: FilterType;
  config?: {
    options?: string[];
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
  };
}

const FiltersPage = () => {
  const { token, isAuthenticated } = useAuth();
  const [filters, setFilters] = useState<Filter[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<Filter | undefined>(undefined);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    description: '',
    category: '',
    type: 'select',
    config: {
      options: [''],
      min: 0,
      max: 100,
      step: 1,
      unit: '',
    },
  });

  const fetchFilters = async () => {
    try {
      const data = await filtersService.getAllFilters();
      setFilters(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoriesService.getAllCategories();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchFilters();
      fetchCategories();
    }
  }, [isAuthenticated, token]);

  const handleOpenModal = (filter?: Filter) => {
    if (filter) {
      setSelectedFilter(filter);
      setFormData({
        name: filter.name,
        slug: filter.slug,
        description: filter.description,
        category: filter.category._id,
        type: filter.type,
        config: filter.config,
      });
    } else {
      setSelectedFilter(undefined);
      setFormData({
        name: '',
        slug: '',
        description: '',
        category: '',
        type: 'select',
        config: {
          options: [''],
          min: 0,
          max: 100,
          step: 1,
          unit: '',
        },
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedFilter(undefined);
    setFormData({
      name: '',
      slug: '',
      description: '',
      category: '',
      type: 'select',
      config: {
        options: [''],
        min: 0,
        max: 100,
        step: 1,
        unit: '',
      },
    });
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedFilter) {
        // Update existing filter
        const updateData: UpdateFilterData = {
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          category: formData.category,
          type: formData.type,
          config: formData.config,
        };
        await filtersService.updateFilter(selectedFilter._id, updateData);
      } else {
        // Create new filter
        const createData: CreateFilterData = {
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          category: formData.category,
          type: formData.type,
          config: formData.config,
        };
        await filtersService.createFilter(createData);
      }

      handleCloseModal();
      fetchFilters();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this filter?')) {
      return;
    }

    try {
      await filtersService.deleteFilter(id);
      fetchFilters();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.config?.options || []];
    newOptions[index] = value;
    setFormData({
      ...formData,
      config: {
        ...formData.config,
        options: newOptions,
      },
    });
  };

  const addOption = () => {
    setFormData({
      ...formData,
      config: {
        ...formData.config,
        options: [...formData.config?.options || [], ''],
      },
    });
  };

  const removeOption = (index: number) => {
    const newOptions = formData.config?.options?.filter((_, i) => i !== index) || [];
    setFormData({
      ...formData,
      config: {
        ...formData.config,
        options: newOptions,
      },
    });
  };

  const handleTypeChange = (type: FilterType) => {
    setFormData({
      ...formData,
      type,
      config: {
        options: type === 'boolean' ? ['Yes', 'No'] : [''],
        min: 0,
        max: 100,
        step: 1,
        unit: '',
      },
    });
  };

  const renderCategoryOptions = (categories: Category[], level: number = 0) => {
    return categories.map((category) => (
      <React.Fragment key={category._id}>
        <option value={category._id} className={level > 0 ? `pl-${level * 4}` : ''}>
          {'\u00A0'.repeat(level * 4)}{category.name} ({category.slug})
        </option>
        {category.children && renderCategoryOptions(category.children, level + 1)}
      </React.Fragment>
    ));
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
        <h1 className="text-2xl font-bold text-gray-600">Filters</h1>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Filter
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filters.length === 0 ? (
            <li className="px-4 py-4">No filters found.</li>
          ) : (
            filters.map((filter) => (
              <li key={filter._id} className="px-4 py-4 hover:bg-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <p className="text-sm font-medium text-gray-900">{filter.name}</p>
                    <p className="text-sm text-gray-500">{filter.description}</p>
                    <p className="text-sm text-gray-500">Category: {filter.category.name}</p>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        filter.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {filter.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleOpenModal(filter)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(filter._id)}
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

      {isModalOpen && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal}
          title={selectedFilter ? 'Edit Filter' : 'Add Filter'}
        >
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all duration-200 outline-none peer text-gray-800"
                    required
                  >
                    <option value="">Select a category</option>
                    {renderCategoryOptions(categories)}
                  </select>
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                    Filter Type
                  </label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => handleTypeChange(e.target.value as FilterType)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all duration-200 outline-none peer text-gray-800"
                    required
                  >
                    <option value="select">Select (Multiple Options)</option>
                    <option value="range">Range (Min-Max)</option>
                    <option value="color">Color</option>
                    <option value="boolean">Boolean (Yes/No)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all duration-200 outline-none peer text-gray-800"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                    Slug
                  </label>
                  <input
                    type="text"
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all duration-200 outline-none peer text-gray-800"
                    required
                    placeholder="filter-slug"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all duration-200 outline-none peer text-gray-800"
                    rows={3}
                  />
                </div>

                {formData.type === 'select' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Options
                    </label>
                    {formData.config?.options?.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all duration-200 outline-none peer text-gray-800"
                          placeholder={`Option ${index + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="px-3 py-2 text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addOption}
                      className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      Add Option
                    </button>
                  </div>
                )}

                {formData.type === 'range' && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="min" className="block text-sm font-medium text-gray-700">
                        Minimum Value
                      </label>
                      <input
                        type="number"
                        id="min"
                        value={formData.config?.min}
                        onChange={(e) => setFormData({
                          ...formData,
                          config: { ...formData.config, min: Number(e.target.value) }
                        })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all duration-200 outline-none peer text-gray-800"
                      />
                    </div>
                    <div>
                      <label htmlFor="max" className="block text-sm font-medium text-gray-700">
                        Maximum Value
                      </label>
                      <input
                        type="number"
                        id="max"
                        value={formData.config?.max}
                        onChange={(e) => setFormData({
                          ...formData,
                          config: { ...formData.config, max: Number(e.target.value) }
                        })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all duration-200 outline-none peer text-gray-800"
                      />
                    </div>
                    <div>
                      <label htmlFor="step" className="block text-sm font-medium text-gray-700">
                        Step
                      </label>
                      <input
                        type="number"
                        id="step"
                        value={formData.config?.step}
                        onChange={(e) => setFormData({
                          ...formData,
                          config: { ...formData.config, step: Number(e.target.value) }
                        })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all duration-200 outline-none peer text-gray-800"
                      />
                    </div>
                    <div>
                      <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                        Unit (e.g., kg, cm, $)
                      </label>
                      <input
                        type="text"
                        id="unit"
                        value={formData.config?.unit}
                        onChange={(e) => setFormData({
                          ...formData,
                          config: { ...formData.config, unit: e.target.value }
                        })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all duration-200 outline-none peer text-gray-800"
                      />
                    </div>
                  </div>
                )}

                {formData.type === 'color' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Color Options
                    </label>
                    {formData.config?.options?.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="color"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          className="w-12 h-12 rounded border border-gray-200"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all duration-200 outline-none peer text-gray-800"
                          placeholder={`Color ${index + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="px-3 py-2 text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addOption}
                      className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      Add Color
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {selectedFilter ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default FiltersPage; 