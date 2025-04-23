import React, { useState, useMemo, useEffect } from 'react';

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

interface Filter {
  _id: string;
  name: string;
  description: string;
}

// Define a more flexible Product interface that can handle both string and object types
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  seller: string | {
    _id: string;
    firstName?: string;
    lastName?: string;
    businessName?: string;
    email: string;
  };
  category: string | {
    _id: string;
    name: string;
  };
  images: string[];
  isActive: boolean;
  productFeatureValues?: FeatureGroup[];
  filters?: Filter[];
  createdAt: string;
  updatedAt?: string;
}

interface Category {
  _id: string;
  name: string;
}

interface ProductsGridProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onToggleStatus?: (productId: string, currentStatus: boolean) => void;
  showFeatures?: boolean;
  expandedProductId?: string | null;
  onToggleExpansion?: (productId: string) => void;
  viewMode?: 'table' | 'list';
  categories?: Category[];
  filters?: Filter[];
  showFilters?: boolean;
}

const ProductsGrid: React.FC<ProductsGridProps> = ({
  products,
  onEdit,
  onDelete,
  onToggleStatus,
  showFeatures = false,
  expandedProductId = null,
  onToggleExpansion,
  viewMode = 'table',
  categories = [],
  filters = [],
  showFilters = false
}) => {
  // Filter state
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Get available filters for the selected category
  const availableFilters = useMemo(() => {
    if (!selectedCategory) return [];
    return filters.filter(filter => {
      // Check if any product in the selected category has this filter
      return products.some(product => {
        const productCategory = typeof product.category === 'object' ? product.category._id : product.category;
        return productCategory === selectedCategory && product.filters?.some(f => f._id === filter._id);
      });
    });
  }, [filters, selectedCategory, products]);

  // Reset filter when category changes
  useEffect(() => {
    setSelectedFilter('');
  }, [selectedCategory]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = !selectedCategory || 
        (typeof product.category === 'object' ? product.category._id : product.category) === selectedCategory;
      
      const matchesFilter = !selectedFilter || 
        product.filters?.some(f => f._id === selectedFilter);
      
      const matchesSearch = !searchTerm || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategory && matchesFilter && matchesSearch;
    });
  }, [products, selectedCategory, selectedFilter, searchTerm]);

  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedFilter('');
    setSearchTerm('');
  };

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
        <p className="mt-1 text-sm text-gray-500">
          {products.length === 0 
            ? "Get started by creating a new product." 
            : "Try adjusting your filters to find what you're looking for."}
        </p>
        {products.length > 0 && (
          <button
            onClick={resetFilters}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Reset Filters
          </button>
        )}
      </div>
    );
  }

  // Filter controls component
  const FilterControls = () => (
    <div className="mb-4 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">
            Search Products
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or description..."
            className="mt-1 block w-full rounded-md border text-gray-500 border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="mt-1 text-gray-500 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label htmlFor="filter" className="block text-sm font-medium text-gray-700">
            Filter
          </label>
          <select
            id="filter"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            disabled={!selectedCategory || availableFilters.length === 0}
            className="mt-1 text-gray-500 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">All Filters</option>
            {availableFilters.map((filter) => (
              <option key={filter._id} value={filter._id}>
                {filter.name}
              </option>
            ))}
          </select>
          {selectedCategory && availableFilters.length === 0 && (
            <p className="mt-1 text-sm text-gray-500">No filters available for this category</p>
          )}
        </div>
      </div>
      
      {(selectedCategory || selectedFilter || searchTerm) && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={resetFilters}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Clear All Filters
          </button>
          {selectedCategory && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Category: {categories.find(c => c._id === selectedCategory)?.name || selectedCategory}
              <button
                onClick={() => setSelectedCategory('')}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {selectedFilter && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Filter: {filters.find(f => f._id === selectedFilter)?.name || selectedFilter}
              <button
                onClick={() => setSelectedFilter('')}
                className="ml-1 text-purple-600 hover:text-purple-800"
              >
                ×
              </button>
            </span>
          )}
          {searchTerm && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Search: {searchTerm}
              <button
                onClick={() => setSearchTerm('')}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (viewMode === 'table') {
    return (
      <div className="flex flex-col">
        {showFilters && <FilterControls />}
        
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Product
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Price
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Stock
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {product.images && product.images.length > 0 ? (
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={product.images[0]}
                                alt={product.name}
                              />
                            </div>
                          ) : (
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <svg
                                className="h-6 w-6 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {typeof product.category === 'object' ? product.category.name : product.category}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${product.price.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.stock}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => onEdit(product)}
                          className="text-purple-600 hover:text-purple-900 mr-4"
                        >
                          Edit
                        </button>
                        {onToggleStatus && (
                          <button
                            onClick={() => onToggleStatus(product._id, product.isActive)}
                            className={`${
                              product.isActive
                                ? 'text-red-600 hover:text-red-900'
                                : 'text-green-600 hover:text-green-900'
                            } mr-4`}
                          >
                            {product.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                        <button
                          onClick={() => onDelete(product._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      {showFilters && <FilterControls />}
      
      <ul className="divide-y divide-gray-200">
        {filteredProducts.map((product) => (
          <li key={product._id} className="px-4 py-4 hover:bg-gray-50">
            <div className="flex flex-col">
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
                    <div className="mt-1 flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">₾{product.price.toFixed(2)}</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">მარაგში: {product.stock}</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">
                        მაღაზია: {
                          typeof product.seller === 'object' 
                            ? (product.seller?.businessName || `${product.seller?.firstName} ${product.seller?.lastName}`.trim())
                            : product.seller
                        }
                      </span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">
                        კატეგორია: {typeof product.category === 'object' ? product.category.name : product.category}
                      </span>
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
                    onClick={() => onEdit(product)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(product._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                  {showFeatures && onToggleExpansion && (
                    <button
                      onClick={() => onToggleExpansion(product._id)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      {expandedProductId === product._id ? 'Hide Features' : 'Show Features'}
                    </button>
                  )}
                </div>
              </div>
              
              {/* Product Features Section */}
              {showFeatures && expandedProductId === product._id && product.productFeatureValues && product.productFeatureValues.length > 0 && (
                <div className="mt-4 pl-4 border-l-2 border-gray-200">
                  <h4 className="text-md font-medium text-gray-800 mb-2">Product Features</h4>
                  <div className="space-y-4">
                    {product.productFeatureValues.map((group, groupIndex) => (
                      <div key={groupIndex} className="border border-gray-200 rounded-md p-3">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">
                          {group.featureGroupCaption} (ID: {group.featureGroupId})
                        </h5>
                        <div className="ml-4 space-y-2">
                          {group.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="border-l-2 border-gray-200 pl-3">
                              <h6 className="text-sm font-medium text-gray-600">
                                {feature.featureCaption} (ID: {feature.featureId})
                              </h6>
                              <div className="ml-4">
                                {feature.featureValues.map((value, valueIndex) => (
                                  <div key={valueIndex} className="text-sm text-gray-500">
                                    Type {value.type}: {value.featureValue}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Filters Section */}
                  {product.filters && product.filters.length > 0 && (
                    <>
                      <h4 className="text-md font-medium text-gray-800 mb-2 mt-4">Filters</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.filters.map((filter) => (
                          <span 
                            key={filter._id} 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                          >
                            {filter.name}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductsGrid; 