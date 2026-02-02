'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import CloudinaryUploadWidget from './CloudinaryUploadWidget';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { filtersService, Filter } from '../services/filtersService';
import { useAuth } from '../utils/authContext';
import HierarchicalCategorySelect from './HierarchicalCategorySelect';
import { Category } from '../types/category';
import { productsService } from '../services/productsService';
import type { User } from '../types/user';

// Use dynamic import with no SSR to avoid hydration issues
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <p>Loading editor...</p>
});

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
    productSlug?: string;
    description: string;
    price: number;
    stock: number;
    seller: string | {
      _id: string;
      storeName?: string;
      email: string;
      phone?: string;
    };
    category: string | { _id: string; name: string };
    images: string[];
    isActive: boolean;
    productFeatureValues?: FeatureGroup[];
    discountedPercent?: number;
    discountStartDate?: string;
    discountEndDate?: string;
    discountedPrice?: number;
  };
  categories: Category[];
  sellers: User[];
  onClose: () => void;
  onSuccess: () => void;
  isSellerContext?: boolean;
}

// Add this new component for rendering individual filters
const FilterInput: React.FC<{
  filter: Filter;
  value: string;
  onChange: (value: string) => void;
}> = ({ filter, value, onChange }) => {
  if (filter.type === 'color') {
    return (
      <div className="space-y-1">
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {filter.config?.options?.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onChange(color)}
              className={`relative p-1 rounded-lg border-2 transition-all duration-200 ${
                value === color 
                  ? 'border-sky-500 ring-2 ring-sky-200' 
                  : 'border-gray-200 hover:border-sky-300'
              }`}
              title={color}
            >
              <span 
                className="block w-full h-8 rounded-md"
                style={{ backgroundColor: color }}
              />
              {value === color && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (filter.type === 'select') {
    return (
      <div className="space-y-1">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200 ease-in-out text-gray-600"
        >
          <option value="">Select {filter.name}</option>
          {filter.config?.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return null;
};

export default function ProductForm({ product, categories, sellers, onClose, onSuccess, isSellerContext = false }: ProductFormProps) {
  const { user } = useAuth();
  const [name, setName] = useState(product?.name || '');
  const [productSlug, setProductSlug] = useState(product?.productSlug || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState<number>(product?.price || 0);
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [category, setCategory] = useState(typeof product?.category === 'string' ? product.category : product?.category?._id || '');
  const [sellerId, setSellerId] = useState(() => {
    if (product?.seller) {
      return typeof product.seller === 'string' ? product.seller : product.seller._id;
    }
    if (isSellerContext && user) {
      return user._id || '';
    }
    return '';
  });
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [stock, setStock] = useState<number>(product?.stock || 0);
  const [discountedPercent, setDiscountedPercent] = useState<number>(product?.discountedPercent || 0);
  const [discountStartDate, setDiscountStartDate] = useState<string>(product?.discountStartDate ? new Date(product.discountStartDate).toISOString().split('T')[0] : '');
  const [discountEndDate, setDiscountEndDate] = useState<string>(product?.discountEndDate ? new Date(product.discountEndDate).toISOString().split('T')[0] : '');
  
  // Calculate discounted price for display
  const calculatedDiscountedPrice = discountedPercent > 0 ? price - (price * (discountedPercent / 100)) : null;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filters state
  const [filters, setFilters] = useState<Filter[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]); // Keep for UI state
  const [filterValues, setFilterValues] = useState<Record<string, string>>({}); // Store filter values by filter name/key
  const [filtersLoading, setFiltersLoading] = useState(false);
  const hasSyncedFiltersRef = useRef(false); // Track if we've synced filters from product data
  
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
  
  // Helper function to convert filter name to key
  const getFilterKey = (filterName: string): string => {
    return filterName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
  };
  
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
      if (!category) {
        setFilters([]);
        setSelectedFilters([]);
        return;
      }

      setFiltersLoading(true);
      try {
        const categoryFilters = await filtersService.getFiltersByCategory(category);
        setFilters(categoryFilters);
        
        // Reset selected filters when category changes (unless editing existing product)
        if (!product) {
          setSelectedFilters([]);
          setFilterValues({});
        }
      } catch (error) {
        console.error('Error fetching filters:', error);
        setError('Failed to load filters');
      } finally {
        setFiltersLoading(false);
      }
    };

    fetchFilters();
  }, [category, product]);

  // Sync filterValues with selectedFilters UI state when filters are first loaded (only for editing)
  // This should only run once when filters are loaded, not on every filterValues change
  useEffect(() => {
    // Only sync when:
    // 1. We have a product (editing mode)
    // 2. Filters are loaded and not loading
    // 3. We haven't synced yet
    if (product && filters.length > 0 && !filtersLoading && !hasSyncedFiltersRef.current) {
      // Access filterValues from state (it's in the closure)
      if (Object.keys(filterValues).length > 0) {
        const syncedFilters: string[] = [];
        
        filters.forEach(filter => {
          // Use filter slug as key (not filter ID)
          const value = filterValues[filter.slug];
          if (value) {
            syncedFilters.push(`${filter.slug}:${value}`);
          }
        });
        
        if (syncedFilters.length > 0) {
          setSelectedFilters(syncedFilters);
          hasSyncedFiltersRef.current = true;
        }
      }
    }
    
    // Reset sync flag when product changes or filters are cleared
    if (!product || filters.length === 0) {
      hasSyncedFiltersRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.length, filtersLoading, product]); // filterValues intentionally excluded to prevent re-sync on user changes

  // Update sellerId when user changes
  useEffect(() => {
    if (isSellerContext && user) {
      const currentUserId = user._id;
      if (currentUserId) {
        setSellerId(currentUserId);
      }
    }
  }, [isSellerContext, user]);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setProductSlug(product.productSlug || '');
      setDescription(product.description);
      setPrice(product.price);
      setStock(product.stock);
      setCategory(typeof product.category === 'string' ? product.category : product.category._id);
      setImages(product.images);
      setIsActive(product.isActive);
      setSellerId(typeof product.seller === 'string' ? product.seller : product.seller._id);
      if (product.productFeatureValues) {
        setFeatureGroups(product.productFeatureValues);
      }
      
      // Extract filter values from product filters array
      // Filters array contains objects with { id, slug?, value } where id can be filter ID or slug
      const extractedFilterValues: Record<string, string> = {};
      if (product && (product as any).filters) {
        const productFilters = (product as any).filters;
        if (Array.isArray(productFilters)) {
          productFilters.forEach((filterItem: any) => {
            // Handle both formats: { id: '...', slug?: '...', value: '...' } or just string ID
            if (typeof filterItem === 'object' && filterItem !== null) {
              if (filterItem.id && filterItem.value) {
                // New format: { id, slug?, value } - id might be ID or slug
                // If slug is provided, use it directly; otherwise find the filter by ID or slug
                if (filterItem.slug) {
                  extractedFilterValues[filterItem.slug] = filterItem.value;
                } else {
                  // Find the filter by ID or slug to get the slug
                  const filter = filters.find(f => f._id === filterItem.id || f.slug === filterItem.id);
                  if (filter) {
                    extractedFilterValues[filter.slug] = filterItem.value;
                  } else {
                    // Fallback: use the id as-is (might be slug already)
                    extractedFilterValues[filterItem.id] = filterItem.value;
                  }
                }
              } else if (filterItem._id) {
                // Populated filter object - find by ID to get slug
                const filter = filters.find(f => f._id === filterItem._id);
                if (filter) {
                  // Value might be in productFeatureValues or other source
                  // We'll handle this in the sync logic
                }
              }
            } else if (typeof filterItem === 'string') {
              // Old format: just filter ID, value might be in productFeatureValues
              // Find filter by ID to get slug
              const filter = filters.find(f => f._id === filterItem);
              if (filter) {
                // We'll handle this in the sync logic
              }
            }
          });
        }
      }
      setFilterValues(extractedFilterValues);
    } else {
      // Clear filter values when switching to create mode
      setFilterValues({});
    }
  }, [product]);

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
      // Prepare filters array with id, slug, and value
      const filtersArray = selectedFilters
        .map(filterStr => {
          const [filterSlug, value] = filterStr.split(':');
          if (value) {
            // Find filter by slug to get id and slug
            const filter = filters.find(f => f.slug === filterSlug);
            if (filter) {
              return { 
                id: filter._id, 
                slug: filter.slug, 
                value: value 
              };
            }
          }
          return null;
        })
        .filter((f): f is { id: string; slug: string; value: string } => f !== null);

      // Build product data with filter values stored in filters array
      const productData: any = {
        name,
        description,
        price,
        stock,
        images,
        category,
        seller: sellerId,
        isActive,
        productFeatureValues: featureGroups,
        filters: filtersArray, // Array of { id, value } objects
        discountedPercent,
        discountStartDate: discountStartDate || undefined,
        discountEndDate: discountEndDate || undefined
      };
      if (productSlug.trim() !== '') {
        productData.productSlug = productSlug.trim();
      }

      if (product?._id) {
        await productsService.updateProduct(product._id, productData);
      } else {
        await productsService.createProduct(productData);
      }

      onSuccess();
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
    if (newFeatureGroup.featureGroupCaption) {
      const nextId = featureGroups.length === 0
        ? 1
        : Math.max(...featureGroups.map((g) => g.featureGroupId)) + 1;
      setFeatureGroups([...featureGroups, { ...newFeatureGroup, featureGroupId: nextId }]);
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
    if (newFeature.featureCaption) {
      const features = featureGroups[groupIndex].features;
      const nextId = features.length === 0
        ? 1
        : Math.max(...features.map((f) => f.featureId)) + 1;
      const updatedGroups = [...featureGroups];
      updatedGroups[groupIndex].features.push({ ...newFeature, featureId: nextId });
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
      const featureValues = featureGroups[groupIndex].features[featureIndex].featureValues;
      const nextType = featureValues.length === 0
        ? 1
        : Math.max(...featureValues.map((v) => v.type)) + 1;
      const updatedGroups = [...featureGroups];
      updatedGroups[groupIndex].features[featureIndex].featureValues.push({
        type: nextType,
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200 ease-in-out text-gray-600"
          required
        />
      </div>

      <div>
        <label htmlFor="productSlug" className="block text-sm font-medium text-gray-700 mb-1">
          Product Slug (unique URL segment)
        </label>
        <input
          type="text"
          id="productSlug"
          value={productSlug}
          onChange={(e) => setProductSlug(e.target.value)}
          placeholder="e.g. my-product-name"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200 ease-in-out text-gray-600"
        />
        <p className="mt-1 text-xs text-gray-500">
          Saved as lowercase, strict slug. Must be unique. Used in URL: /products/product/[slug]
        </p>
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
              className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200 ease-in-out text-gray-600"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200 ease-in-out text-gray-600"
            min="0"
            required
          />
        </div>
      </div>

      {/* Discount Fields */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label htmlFor="discountedPercent" className="block text-sm font-medium text-gray-700 mb-1">
            ფასდაკლების პროცენტი (%)
          </label>
          <input
            type="number"
            id="discountedPercent"
            value={discountedPercent}
            onChange={(e) => setDiscountedPercent(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200 ease-in-out text-gray-600"
            min="0"
            max="100"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            გამოთვლილი ფასდაკლებული ფასი
          </label>
          <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
            {calculatedDiscountedPrice !== null ? `₾${calculatedDiscountedPrice.toFixed(2)}` : '0'}
          </div>
        </div>

        <div>
          <label htmlFor="discountStartDate" className="block text-sm font-medium text-gray-700 mb-1">
            ფასდაკლების დაწყების თარიღი
          </label>
          <input
            type="date"
            id="discountStartDate"
            value={discountStartDate}
            onChange={(e) => setDiscountStartDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200 ease-in-out text-gray-600"
          />
        </div>

        <div>
          <label htmlFor="discountEndDate" className="block text-sm font-medium text-gray-700 mb-1">
            ფასდაკლების დასრულების თარიღი
          </label>
          <input
            type="date"
            id="discountEndDate"
            value={discountEndDate}
            onChange={(e) => setDiscountEndDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200 ease-in-out text-gray-600"
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

      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Category
          </label>
          <HierarchicalCategorySelect
            categories={categories}
            value={category}
            onChange={setCategory}
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Filters
          </label>
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            {filtersLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-500"></div>
                <span className="ml-2 text-gray-500">Loading filters...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filters.map((filter) => (
                  <div key={filter._id} className="space-y-2 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <label className="block text-sm font-medium text-gray-700">
                      {filter.name}
                      {filter.description && (
                        <span className="ml-1 text-gray-500 text-xs">
                          ({filter.description})
                        </span>
                      )}
                    </label>
                    <FilterInput
                      filter={filter}
                      value={selectedFilters.find(f => f.startsWith(`${filter.slug}:`))?.split(':')[1] || ''}
                      onChange={(newValue) => {
                        // Update selectedFilters for UI state (using slug)
                        const newFilters = selectedFilters.filter(f => !f.startsWith(`${filter.slug}:`));
                        if (newValue) {
                          newFilters.push(`${filter.slug}:${newValue}`);
                        }
                        setSelectedFilters(newFilters);
                        
                        // Update filterValues for product data (using filter slug as key)
                        setFilterValues(prev => {
                          const updated = { ...prev };
                          if (newValue) {
                            updated[filter.slug] = newValue;
                          } else {
                            // Remove filter value if cleared
                            delete updated[filter.slug];
                          }
                          return updated;
                        });
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {!isSellerContext && (
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            მაღაზია
          </label>
          <select
            value={sellerId}
            onChange={(e) => setSellerId(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="">აირჩიე მაღაზია</option>
            {sellers.map((seller) => (
              <option key={seller._id} value={seller._id}>
                {seller.sellerProfile?.storeName || `${seller.firstName || ''} ${seller.lastName || ''}`.trim() || seller.email}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-5 w-5 text-sky-600 focus:ring-sky-500 border-gray-300 rounded transition duration-200"
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
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                        <input
                          type="text"
                          placeholder="მნიშვნელობა"
                          value={newFeatureValue.featureValue}
                          onChange={(e) => setNewFeatureValue({...newFeatureValue, featureValue: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200 ease-in-out text-sm text-gray-600"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddFeatureValue(groupIndex, featureIndex)}
                          className="px-3 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition duration-200 text-sm font-medium"
                        >
                          დამატება
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Add new feature to this group */}
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <h6 className="text-sm font-medium text-gray-700 mb-2">მახასიათებლის დამატება</h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Feature Caption"
                      value={newFeature.featureCaption}
                      onChange={(e) => setNewFeature({...newFeature, featureCaption: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200 ease-in-out text-sm text-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddFeature(groupIndex)}
                      className="px-3 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition duration-200 text-sm font-medium"
                    >
                      მახასიათებლის დამატება
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Add new feature group */}
          <div className="border border-gray-200 rounded-lg p-4 shadow-sm">
            <h4 className="text-md font-medium text-gray-800 mb-4">მახასიათებლების ჯგუფის დამატება</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="ჯგუფის სახელი"
                value={newFeatureGroup.featureGroupCaption}
                onChange={(e) => setNewFeatureGroup({...newFeatureGroup, featureGroupCaption: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200 ease-in-out text-gray-600"
              />
              <button
                type="button"
                onClick={handleAddFeatureGroup}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition duration-200 font-medium"
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
          className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition duration-200 font-medium"
        >
          {loading ? 'შენახვა...' : product ? 'რედაქტირება' : 'შენახვა'}
        </button>
      </div>
    </form>
  );
} 