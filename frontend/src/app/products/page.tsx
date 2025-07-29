'use client';

import { useState, useEffect, useRef, ReactNode, Suspense } from 'react';
import ProductDetailPanel from '../../components/ProductDetailPanel';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../utils/api';
import { filtersService, Filter } from '../../services/filtersService';
import { Product } from '../../types/product';
import CategoryNavigation from '../../components/CategoryNavigation';
import { Category } from '../../types/category';

// Product Skeleton Loader Component
const ProductSkeleton = () => (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <div className="relative aspect-square bg-gray-200 animate-pulse"></div>
    <div className="p-4">
      <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
      <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
      <div className="mt-2 flex items-center justify-between">
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  </div>
);

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams() ?? new URLSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [expandedFilters, setExpandedFilters] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category') || null
  );
  const [selectedFilter, setSelectedFilter] = useState<string | null>(
    searchParams.get('filter') || null
  );
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [filtersLoading, setFiltersLoading] = useState(false);
  
  // Mobile sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Price range state
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [minPriceInput, setMinPriceInput] = useState<string>('0');
  const [maxPriceInput, setMaxPriceInput] = useState<string>('1000');
  
  // Slider refs
  const sliderRef = useRef<HTMLDivElement>(null);
  const minThumbRef = useRef<HTMLDivElement>(null);
  const maxThumbRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);

  // Add new state for selected colors and options
  const [selectedColors, setSelectedColors] = useState<Record<string, string[]>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});

  // Fetch products whenever query parameters change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        
        // Get all current query parameters
        const params = new URLSearchParams();
        
        // Add category if present
        const category = searchParams.get('category');
        if (category) {
          params.append('category', category);
        }
        
        // Add all filter parameters
        searchParams.forEach((value, key) => {
          const filter = filters.find(f => f._id === key);
          if (filter) {
            params.append(key, value);
          }
        });
        
        // Add price range if present
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);
        
        const queryString = params.toString();
        const endpoint = queryString ? `/api/products?${queryString}` : '/api/products';
        
        console.log('Fetching products with params:', queryString); // Debug log
        
        const data = await api.get(endpoint, undefined, false);
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to fetch products');
      } finally {
        setProductsLoading(false);
        setInitialLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams, filters]); // Added filters dependency

  // Update local state when URL parameters change
  useEffect(() => {
    setSelectedCategory(searchParams.get('category'));
    setSelectedFilter(searchParams.get('filter'));
    
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice && maxPrice) {
      setPriceRange([Number(minPrice), Number(maxPrice)]);
      setMinPriceInput(minPrice);
      setMaxPriceInput(maxPrice);
    }
  }, [searchParams]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.get('/api/categories', undefined, false);
        console.log(data);
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  // Fetch all products for counting
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const data = await api.get('/api/products', undefined, false);
        setAllProducts(data);
      } catch (err) {
        console.error('Error fetching all products:', err);
      }
    };

    fetchAllProducts();
  }, []);

  // Calculate product counts for each category using allProducts
  useEffect(() => {
    if (allProducts.length > 0) {
      const categoryCounts = allProducts.reduce((acc, product) => {
        const categoryId = typeof product.category === 'object' && product.category !== null
          ? product.category._id
          : product.category;
        acc[categoryId] = (acc[categoryId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setCategories(prevCategories => 
        prevCategories.map(category => ({
          ...category,
          productCount: categoryCounts[category._id] || 0
        }))
      );
    }
  }, [allProducts]);

  // Calculate min and max prices from all products
  useEffect(() => {
    if (allProducts.length > 0) {
      const prices = allProducts.map(product => product.price);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      setMinPrice(min);
      setMaxPrice(max);
      setPriceRange([min, max]);
      setMinPriceInput(min.toString());
      setMaxPriceInput(max.toString());
    }
  }, [allProducts]);

  // Fetch filters
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setFiltersLoading(true);
        // Use getActiveFilters to only show active filters
        const data = await filtersService.getActiveFilters();
        
        // If no filters are returned, create some example filters for demonstration
        if (data.length === 0) {
          const exampleFilters = createExampleFilters();
          setFilters(exampleFilters);
        } else {
          setFilters(data);
        }
      } catch (err) {
        console.error('Error fetching filters:', err);
        // Create example filters if there's an error
        const exampleFilters = createExampleFilters();
        setFilters(exampleFilters);
      } finally {
        setFiltersLoading(false);
      }
    };

    fetchFilters();
  }, []);

  // Function to create example filters for demonstration
  const createExampleFilters = () => {
    // Get the first category if available
    const firstCategory = categories.length > 0 ? categories[0] : { _id: 'example-category', name: 'Example Category' };
    
    return [
      {
        _id: 'filter-category',
        name: 'Category Filter',
        description: 'Filter by category',
        category: firstCategory,
        type: 'select' as const,
        config: {
          options: ['Electronics', 'Clothing', 'Home', 'Sports']
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'filter-color',
        name: 'Color Filter',
        description: 'Filter by color',
        category: firstCategory,
        type: 'color' as const,
        config: {
          options: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00']
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  };

  // Fetch filters by category when category changes
  useEffect(() => {
    const fetchFiltersByCategory = async () => {
      if (selectedCategory) {
        try {
          setFiltersLoading(true);
          console.log(selectedCategory);
          const data = await filtersService.getFiltersByCategory(selectedCategory);
          setFilters(data);
        } catch (err) {
          console.error('Error fetching filters by category:', err);
        } finally {
          setFiltersLoading(false);
        }
      }
    };

    fetchFiltersByCategory();
  }, [selectedCategory]);

  // Since we're now fetching filtered products from the server,
  // we can simply use the products array directly
  const filteredProducts = products;

  // Handle price input change
  const handlePriceInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let newPriceRange = [...priceRange] as [number, number];
    
    if (e.target.name === 'min') {
      setMinPriceInput(value);
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue <= priceRange[1]) {
        newPriceRange = [numValue, priceRange[1]];
        setPriceRange(newPriceRange);
      }
    } else {
      setMaxPriceInput(value);
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue >= priceRange[0]) {
        newPriceRange = [priceRange[0], numValue];
        setPriceRange(newPriceRange);
      }
    }
    
    // Only fetch products if the price range actually changed
    if (newPriceRange[0] !== priceRange[0] || newPriceRange[1] !== priceRange[1]) {
      setProductsLoading(true);
      
      try {
        // Construct URL with category, filter, and price range parameters
        const params = new URLSearchParams();
        
        if (selectedCategory) {
          params.append('category', selectedCategory);
        }
        
        if (selectedFilter) {
          params.append('filter', selectedFilter);
        }
        
        // Add price range parameters
        params.append('minPrice', newPriceRange[0].toString());
        params.append('maxPrice', newPriceRange[1].toString());
        
        const queryString = params.toString();
        const endpoint = queryString ? `/api/products?${queryString}` : '/api/products';
        
        const data = await api.get(endpoint, undefined, false);
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products by price range:', err);
        setError('Failed to fetch products by price range');
      } finally {
        setProductsLoading(false);
      }
    }
  };

  // Handle mouse down on thumb
  const handleThumbMouseDown = (e: React.MouseEvent, thumb: 'min' | 'max') => {
    e.preventDefault();
    setIsDragging(thumb);
  };

  // Handle mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !sliderRef.current) return;
      
      const sliderRect = sliderRef.current.getBoundingClientRect();
      const sliderWidth = sliderRect.width;
      
      // Calculate position as percentage
      let position = ((e.clientX - sliderRect.left) / sliderWidth) * 100;
      
      // Clamp position between 0 and 100
      position = Math.max(0, Math.min(100, position));
      
      // Convert percentage to price value
      const priceValue = Math.round(minPrice + (position / 100) * (maxPrice - minPrice));
      
      let newPriceRange = [...priceRange] as [number, number];
      
      if (isDragging === 'min') {
        // Ensure min doesn't exceed max
        if (priceValue <= priceRange[1]) {
          newPriceRange = [priceValue, priceRange[1]];
          setPriceRange(newPriceRange);
          setMinPriceInput(priceValue.toString());
        }
      } else {
        // Ensure max doesn't go below min
        if (priceValue >= priceRange[0]) {
          newPriceRange = [priceRange[0], priceValue];
          setPriceRange(newPriceRange);
          setMaxPriceInput(priceValue.toString());
        }
      }
    };
    
    const handleMouseUp = async () => {
      if (isDragging) {
        // Fetch products when the slider is released
        setProductsLoading(true);
        
        try {
          // Construct URL with category, filter, and price range parameters
          const params = new URLSearchParams();
          
          if (selectedCategory) {
            params.append('category', selectedCategory);
          }
          
          if (selectedFilter) {
            params.append('filter', selectedFilter);
          }
          
          // Add price range parameters
          params.append('minPrice', priceRange[0].toString());
          params.append('maxPrice', priceRange[1].toString());
          
          const queryString = params.toString();
          const endpoint = queryString ? `/api/products?${queryString}` : '/api/products';
          
          const data = await api.get(endpoint, undefined, false);
          setProducts(data);
        } catch (err) {
          console.error('Error fetching products by price range:', err);
          setError('Failed to fetch products by price range');
        } finally {
          setProductsLoading(false);
        }
      }
      
      setIsDragging(null);
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, minPrice, maxPrice, priceRange, selectedCategory, selectedFilter]);

  // Calculate thumb positions
  const minThumbPosition = ((priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100;
  const maxThumbPosition = ((priceRange[1] - minPrice) / (maxPrice - minPrice)) * 100;

  useEffect(() => {
    const productId = searchParams.get('product');
    
    if (productId && products.length > 0) {
      const product = products.find(p => p._id === productId);
      if (product) {
        setSelectedProduct(product);
      }
    }
  }, [searchParams, products]);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    router.push(`/products?product=${product._id}`, { scroll: false });
  };

  const handlePanelClose = () => {
    setSelectedProduct(null);
    router.push('/products', { scroll: false });
  };

  const handleCategorySelect = async (categoryId: string | null) => {
    // Update URL with selected category
    const params = new URLSearchParams(searchParams.toString());
    
    if (categoryId) {
      params.set('category', categoryId);
    } else {
      params.delete('category');
    }
    
    // Remove filter when category changes
    params.delete('filter');
    
    // Preserve product ID if it exists
    const productId = searchParams.get('product');
    if (productId) {
      params.set('product', productId);
    }
    
    router.push(`/products?${params.toString()}`, { scroll: false });
    
    // Close sidebar on mobile after selection
    setIsSidebarOpen(false);
  };

  const handleFilterSelect = async (filterId: string | null) => {
    // Update URL with selected filter
    const params = new URLSearchParams(searchParams.toString());
    
    if (filterId) {
      params.set('filter', filterId);
    } else {
      params.delete('filter');
    }
    
    // Preserve product ID if it exists
    const productId = searchParams.get('product');
    if (productId) {
      params.set('product', productId);
    }
    
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  const toggleFilterExpansion = (filterId: string) => {
    setExpandedFilters(prev => ({
      ...prev,
      [filterId]: !prev[filterId]
    }));
  };

  // Add new handlers for color and option selection
  const handleColorSelect = async (filterId: string, color: string) => {
    setSelectedColors(prev => {
      const currentColors = prev[filterId] || [];
      const newColors = currentColors.includes(color)
        ? currentColors.filter(c => c !== color)
        : [...currentColors, color];
      
      return {
        ...prev,
        [filterId]: newColors
      };
    });

    // Update URL parameters
    const params = new URLSearchParams(searchParams.toString());
    const currentColors = selectedColors[filterId] || [];
    const newColors = currentColors.includes(color)
      ? currentColors.filter(c => c !== color)
      : [...currentColors, color];

    if (newColors.length > 0) {
      params.set(filterId, newColors.join(','));
    } else {
      params.delete(filterId);
    }

    // Preserve other parameters
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedFilter) params.set('filter', selectedFilter);
    const productId = searchParams.get('product');
    if (productId) params.set('product', productId);

    // Update URL and fetch filtered products
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  const handleOptionSelect = async (filterId: string, option: string) => {
    setSelectedOptions(prev => {
      const currentOptions = prev[filterId] || [];
      const newOptions = currentOptions.includes(option)
        ? currentOptions.filter(o => o !== option)
        : [...currentOptions, option];
      
      return {
        ...prev,
        [filterId]: newOptions
      };
    });

    // Update URL parameters
    const params = new URLSearchParams(searchParams.toString());
    const currentOptions = selectedOptions[filterId] || [];
    const newOptions = currentOptions.includes(option)
      ? currentOptions.filter(o => o !== option)
      : [...currentOptions, option];

    if (newOptions.length > 0) {
      params.set(filterId, newOptions.join(','));
    } else {
      params.delete(filterId);
    }

    // Preserve other parameters
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedFilter) params.set('filter', selectedFilter);
    const productId = searchParams.get('product');
    if (productId) params.set('product', productId);

    // Update URL and fetch filtered products
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  // Update useEffect to handle filter parameters from URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Reset selections
    setSelectedColors({});
    setSelectedOptions({});

    // Process all parameters
    params.forEach((value, key) => {
      // Find the filter to determine its type
      const filter = filters.find(f => f._id === key);
      if (filter) {
        const values = value.split(',');
        if (filter.type === 'color') {
          setSelectedColors(prev => ({
            ...prev,
            [key]: values
          }));
        } else if (filter.type === 'select') {
          setSelectedOptions(prev => ({
            ...prev,
            [key]: values
          }));
        }
      }
    });
  }, [searchParams, filters]);

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header with Filter Button - Only visible on mobile */}
      <div className="lg:hidden bg-white shadow-sm border-b">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-semibold text-gray-900">პროდუქტები</h1>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            <span>ფილტრები</span>
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Mobile Sidebar Overlay - Only on mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white shadow-lg lg:shadow-none
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:inset-y-auto lg:left-auto lg:z-auto
        `}>
          <div className="h-full overflow-y-auto p-4 lg:p-6 space-y-6">
            {/* Mobile Close Button - Only visible on mobile */}
            <div className="flex items-center justify-between lg:hidden">
              <h2 className="text-lg font-semibold text-gray-900">ფილტრები</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <CategoryNavigation 
              categories={categories} 
              selectedCategorySlug={selectedCategory} 
            />
            
            {/* Filters section */}
            {filters.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4 border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">ფილტრები</h3>
                <div>
                  {filtersLoading ? (
                    <div className="animate-pulse space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-6 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  ) : (
                    filters
                      .map((filter) => (
                        <div key={filter._id} className="border-b border-gray-200 overflow-hidden">
                          <button
                            onClick={() => toggleFilterExpansion(filter._id)}
                            className="w-full flex items-center justify-between pt-3 pb-3 hover:bg-gray-50 transition-colors"
                          >
                            <h3 className="text-sm font-medium text-gray-900">{filter.name}</h3>
                            <svg
                              className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${
                                expandedFilters[filter._id] ? 'rotate-180' : ''
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <div
                            className={`overflow-hidden transition-all duration-200 ease-in-out ${
                              expandedFilters[filter._id] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                            }`}
                          >
                            <div className="p-3 pt-0">
                              {filter.type === 'color' && filter.config?.options && (
                                <div className="grid grid-cols-4 gap-2">
                                  {filter.config.options.map((color) => (
                                    <button
                                      key={color}
                                      className={`w-8 h-8 rounded-full cursor-pointer border-2 transition-colors ${
                                        selectedColors[filter._id]?.includes(color)
                                          ? 'border-purple-500'
                                          : 'border-gray-200 hover:border-purple-500'
                                      }`}
                                      style={{ backgroundColor: color }}
                                      title={color}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleColorSelect(filter._id, color);
                                      }}
                                    />
                                  ))}
                                </div>
                              )}
                              {filter.type === 'select' && filter.config?.options && (
                                <div className="space-y-2">
                                  {filter.config.options.map((option) => (
                                    <div key={option} className="flex items-center">
                                      <input
                                        type="checkbox"
                                        id={`${filter._id}-${option}`}
                                        checked={selectedOptions[filter._id]?.includes(option) || false}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          handleOptionSelect(filter._id, option);
                                        }}
                                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                      />
                                      <label
                                        htmlFor={`${filter._id}-${option}`}
                                        className="ml-2 block text-sm text-gray-700 cursor-pointer"
                                      >
                                        {option}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="p-4 lg:p-8">
            {/* Active Filters Display */}
            {selectedFilter && (
              <div className="mb-4 flex items-center flex-wrap gap-2">
                <span className="text-sm text-gray-600">Filtered by:</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  {filters.find(f => f._id === selectedFilter)?.name || 'Filter'}
                </span>
                <button 
                  onClick={() => handleFilterSelect(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
              {productsLoading ? (
                // Show skeleton loaders while products are loading
                Array(10).fill(0).map((_, index) => (
                  <ProductSkeleton key={index} />
                ))
              ) : (
                // Show actual products when loaded
                filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <div
                      key={product._id}
                      className="bg-white rounded-lg transition-all duration-300 hover:border hover:border-purple-600 overflow-hidden cursor-pointer shadow-sm hover:shadow-md"
                      onClick={() => handleProductSelect(product)}
                    >
                      <div className="relative aspect-square">
                        <img
                          src={product.images[0] || 'https://via.placeholder.com/400'}
                          alt={product.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="p-3 sm:p-4">
                        <p className="text-gray-900 font-semibold text-sm sm:text-base">{product.price.toFixed(2)} ₾</p>
                        <h2 className="text-xs sm:text-sm text-gray-900 mb-2 line-clamp-2 overflow-hidden text-ellipsis">{product.name}</h2>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-gray-500 truncate">
                            {typeof product.seller === 'object' && product.seller !== null
                              ? product.seller.businessName
                              : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500 text-lg">პროდუქტები არ მოიძებნა</p>
                    <button 
                      onClick={() => {
                        handleFilterSelect(null);
                        setPriceRange([minPrice, maxPrice]);
                        setMinPriceInput(minPrice.toString());
                        setMaxPriceInput(maxPrice.toString());
                      }}
                      className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                    >
                      ფილტრის გასუფთავება
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product Detail Panel */}
      <ProductDetailPanel
        product={selectedProduct}
        onClose={handlePanelClose}
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
} 