'use client';

import { useState, useMemo, useEffect } from 'react';
import CloudinaryUploadWidget from './CloudinaryUploadWidget';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { filtersService, Filter } from '../services/filtersService';

// Use dynamic import with no SSR to avoid hydration issues
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <p>Loading editor...</p>
});

interface Category {
  _id: string;
  name: string;
}

interface Seller {
  _id: string;
  name: string;
}

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

interface ProductFormProps {
  product?: {
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
  };
  categories: Category[];
  sellers: Seller[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductForm({ product, categories, sellers, onClose, onSuccess }: ProductFormProps) {
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price || 0);
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [categoryId, setCategoryId] = useState(product?.category || '');
  const [sellerId, setSellerId] = useState(product?.seller || '');
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [stock, setStock] = useState(product?.stock || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filters state
  const [filters, setFilters] = useState<Filter[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [filtersLoading, setFiltersLoading] = useState(false);
  
  // Product features state
  const [featureGroups, setFeatureGroups] = useState<FeatureGroup[]>(product?.productFeatureValues || []);
  const [newFeatureGroup, setNewFeatureGroup] = useState<FeatureGroup>({
    featureGroupId: 0,
    featureGroupCaption: '',
    features: []
  });
  const [newFeature, setNewFeature] = useState<Feature>({
    featureId: 0,
    featureCaption: '',
    featureValues: []
  });
  const [newFeatureValue, setNewFeatureValue] = useState<FeatureValue>({
    type: 1,
    featureValue: ''
  });

  // Add a state to track if the editor is mounted
  const [editorMounted, setEditorMounted] = useState(false);
  
  // Initialize the editor with proper configuration
  useEffect(() => {
    // Set editor as mounted after component mounts
    setEditorMounted(true);
    
    // Add custom CSS for the editor
    const style = document.createElement('style');
    style.innerHTML = `
      .ql-editor {
        color: #000000 !important;
      }
      .ql-editor p {
        color: #000000 !important;
      }
      .ql-color-picker {
        width: 40px;
        height: 24px;
      }
      .ql-picker.ql-color-picker .ql-picker-label {
        width: 100%;
        height: 100%;
      }
      .ql-picker.ql-color-picker .ql-picker-options {
        padding: 3px 5px;
        width: 152px;
      }
      .ql-picker.ql-color-picker .ql-picker-item {
        border-radius: 2px;
        margin-right: 1px;
        margin-bottom: 1px;
        width: 20px;
        height: 20px;
      }
    `;
    document.head.appendChild(style);
    
    // Clean up function
    return () => {
      setEditorMounted(false);
      // Remove the style when component unmounts
      document.head.removeChild(style);
    };
  }, []);

  // Fetch filters when category changes
  useEffect(() => {
    const fetchFilters = async () => {
      if (categoryId) {
        try {
          setFiltersLoading(true);
          const data = await filtersService.getFiltersByCategory(categoryId);
          setFilters(data);
          // Reset selected filters when category changes
          setSelectedFilters([]);
        } catch (err) {
          console.error('Error fetching filters:', err);
          setFilters([]);
        } finally {
          setFiltersLoading(false);
        }
      } else {
        setFilters([]);
        setSelectedFilters([]);
      }
    };

    fetchFilters();
  }, [categoryId]);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'color': [] }, { 'background': [] }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: () => {
          // Handle image upload if needed
          console.log('Image upload clicked');
        }
      }
    },
    clipboard: {
      matchVisual: false
    },
    keyboard: {
      bindings: {
        tab: false
      }
    }
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', 'image',
    'color', 'background'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const productData = {
        name,
        description,
        price: Number(price),
        images,
        category: categoryId,
        seller: sellerId,
        isActive,
        stock: Number(stock),
        productFeatureValues: featureGroups,
        filters: selectedFilters
      };

      const url = product ? `/api/products/${product._id}` : '/api/products';
      const method = product ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save product');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (urls: string[]) => {
    // If we're editing an existing product, append new images to existing ones
    if (product) {
      setImages(prevImages => [...prevImages, ...urls]);
    } else {
      // For new products, just set the new images
      setImages(urls);
    }
  };

  // Feature group management functions
  const handleAddFeatureGroup = () => {
    if (newFeatureGroup.featureGroupId && newFeatureGroup.featureGroupCaption) {
      setFeatureGroups([...featureGroups, { ...newFeatureGroup }]);
      setNewFeatureGroup({
        featureGroupId: 0,
        featureGroupCaption: '',
        features: []
      });
    }
  };

  const handleRemoveFeatureGroup = (index: number) => {
    const updatedGroups = [...featureGroups];
    updatedGroups.splice(index, 1);
    setFeatureGroups(updatedGroups);
  };

  // Feature management functions
  const handleAddFeature = (groupIndex: number) => {
    if (newFeature.featureId && newFeature.featureCaption) {
      const updatedGroups = [...featureGroups];
      updatedGroups[groupIndex].features.push({ ...newFeature });
      setFeatureGroups(updatedGroups);
      setNewFeature({
        featureId: 0,
        featureCaption: '',
        featureValues: []
      });
    }
  };

  const handleRemoveFeature = (groupIndex: number, featureIndex: number) => {
    const updatedGroups = [...featureGroups];
    updatedGroups[groupIndex].features.splice(featureIndex, 1);
    setFeatureGroups(updatedGroups);
  };

  // Feature value management functions
  const handleAddFeatureValue = (groupIndex: number, featureIndex: number) => {
    if (newFeatureValue.featureValue) {
      const updatedGroups = [...featureGroups];
      updatedGroups[groupIndex].features[featureIndex].featureValues.push({ 
        type: newFeatureValue.type || 1,
        featureValue: newFeatureValue.featureValue 
      });
      setFeatureGroups(updatedGroups);
      setNewFeatureValue({
        type: 1,
        featureValue: ''
      });
    }
  };

  const handleRemoveFeatureValue = (groupIndex: number, featureIndex: number, valueIndex: number) => {
    const updatedGroups = [...featureGroups];
    updatedGroups[groupIndex].features[featureIndex].featureValues.splice(valueIndex, 1);
    setFeatureGroups(updatedGroups);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          პროდუქტის სახელი
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 ease-in-out text-gray-600"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            ფასი
          </label>
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">₾</span>
            </div>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 ease-in-out text-gray-600"
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
              მარაგი
          </label>
          <input
            type="number"
            id="stock"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 ease-in-out text-gray-600"
            min="0"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          დეტალური აღწერა
        </label>
        <div className="h-64">
          {editorMounted && (
            <ReactQuill
              theme="snow"
              value={description}
              onChange={setDescription}
              modules={modules}
              formats={formats}
              className="h-48 text-black"
              preserveWhitespace
              placeholder="პროდუქტის დეტალური აღწერა"
            />
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
            სურათები
        </label>
        <CloudinaryUploadWidget
          onUploadSuccess={handleImageUpload}
          initialImages={images}
          maxFiles={5}
        />
        {images.length > 0 && (
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image}
                  alt={`Product image ${index + 1}`}
                  className="h-24 w-24 object-cover rounded-lg shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setImages(images.filter((_, i) => i !== index))}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              კატეგორია
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 ease-in-out text-gray-600"
            required
          >
            <option value="">აირჩიე კატეგორია</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filters" className="block text-sm font-medium text-gray-700 mb-1">
              ფილტრები
          </label>
          <select
            id="filters"
            multiple
            value={selectedFilters}
            onChange={(e) => {
              const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
              setSelectedFilters(selectedOptions);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 ease-in-out text-gray-600"
            disabled={!categoryId || filtersLoading}
          >
            {filtersLoading ? (
              <option value="" disabled>Loading filters...</option>
            ) : filters.length > 0 ? (
              filters.map((filter) => (
                <option key={filter._id} value={filter._id}>
                  {filter.name}
                </option>
              ))
            ) : (
              <option value="" disabled>No filters available for this category</option>
            )}
          </select>
          <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple filters</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="seller" className="block text-sm font-medium text-gray-700 mb-1">
              მაღაზია
          </label>
          <select
            id="seller"
            value={sellerId}
            onChange={(e) => setSellerId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 ease-in-out text-gray-600"
            required
          >
            <option value="">აირჩიე მაღაზია</option>
            {sellers.map((seller) => (
              <option key={seller._id} value={seller._id}>
                {seller.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded transition duration-200"
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
          აქტიური
        </label>
      </div>

      {/* Product Features Section */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">პროდუქტის მახასიათებლები</h3>
        
        {/* Feature Groups */}
        <div className="space-y-6">
          {featureGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-medium text-gray-800">
                  {group.featureGroupCaption} (ID: {group.featureGroupId})
                </h4>
                <button
                  type="button"
                  onClick={() => handleRemoveFeatureGroup(groupIndex)}
                  className="text-red-600 hover:text-red-800 transition duration-200"
                >
                  Remove Group
                </button>
              </div>
              
              {/* Features within this group */}
              <div className="space-y-4 ml-4">
                {group.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="border-l-2 border-gray-200 pl-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="text-sm font-medium text-gray-700">
                        {feature.featureCaption} (ID: {feature.featureId})
                      </h5>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(groupIndex, featureIndex)}
                        className="text-red-600 hover:text-red-800 text-sm transition duration-200"
                      >
                        Remove Feature
                      </button>
                    </div>
                    
                    {/* Feature Values */}
                    <div className="ml-4 space-y-2 mb-4">
                      {feature.featureValues.map((value, valueIndex) => (
                        <div key={valueIndex} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                          <span className="text-sm text-gray-600">
                            Type {value.type}: {value.featureValue}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFeatureValue(groupIndex, featureIndex, valueIndex)}
                            className="ml-2 text-red-600 hover:text-red-800 text-sm transition duration-200"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      
                      {/* Add new feature value */}
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                        <input
                          type="number"
                          placeholder="Type"
                          value={newFeatureValue.type || ''}
                          onChange={(e) => setNewFeatureValue({...newFeatureValue, type: Number(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 ease-in-out text-sm text-gray-600"
                          min="1"
                        />
                        <input
                          type="text"
                          placeholder="Value"
                          value={newFeatureValue.featureValue}
                          onChange={(e) => setNewFeatureValue({...newFeatureValue, featureValue: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 ease-in-out text-sm text-gray-600"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddFeatureValue(groupIndex, featureIndex)}
                          className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200 text-sm font-medium"
                        >
                          Add Value
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Add new feature to this group */}
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <h6 className="text-sm font-medium text-gray-700 mb-2">მახასიათებლის დამატება</h6>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      type="number"
                      placeholder="Feature ID"
                      value={newFeature.featureId || ''}
                      onChange={(e) => setNewFeature({...newFeature, featureId: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 ease-in-out text-sm text-gray-600"
                    />
                    <input
                      type="text"
                      placeholder="Feature Caption"
                      value={newFeature.featureCaption}
                      onChange={(e) => setNewFeature({...newFeature, featureCaption: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 ease-in-out text-sm text-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddFeature(groupIndex)}
                      className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200 text-sm font-medium"
                    >
                      ჯგუფის დამატება
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Add new feature group */}
          <div className="border border-gray-200 rounded-lg p-4 shadow-sm">
            <h4 className="text-md font-medium text-gray-800 mb-4">მახასიათებლების ჯგუფის დამატება</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input
                type="number"
                placeholder="Group ID"
                value={newFeatureGroup.featureGroupId || ''}
                onChange={(e) => setNewFeatureGroup({...newFeatureGroup, featureGroupId: Number(e.target.value)})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 ease-in-out text-gray-600"
              />
              <input
                type="text"
                placeholder="Group Caption"
                value={newFeatureGroup.featureGroupCaption}
                onChange={(e) => setNewFeatureGroup({...newFeatureGroup, featureGroupCaption: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 ease-in-out text-gray-600"
              />
              <button
                type="button"
                onClick={handleAddFeatureGroup}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200 font-medium"
              >
                ჯგუფის დამატება
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
        >
          გაუქმება
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-200 font-medium"
        >
          {loading ? 'შენახვა...' : product ? 'რედაქტირება' : 'შენახვა'}
        </button>
      </div>
    </form>
  );
} 