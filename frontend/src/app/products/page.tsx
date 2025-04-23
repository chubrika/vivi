'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';
import ProductDetailPanel from '../../components/ProductDetailPanel';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../utils/api';
import { filtersService, Filter } from '../../services/filtersService';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: {
    _id: string;
    name: string;
  };
  seller: {
    businessName: string;
    _id: string;
    name: string;
  };
  isActive: boolean;
  stock: number;
}

interface Category {
  _id: string;
  name: string;
  productCount?: number;
}

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

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams() ?? new URLSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<Filter[]>([]);
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

  // Fetch products based on selected category, filter, and price range
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        
        // Construct URL with category and filter parameters
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
        console.error('Error fetching products:', err);
        setError('Failed to fetch products');
      } finally {
        setProductsLoading(false);
        setInitialLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, selectedFilter, priceRange]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.get('/api/categories', undefined, false);
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
        const categoryId = product.category._id;
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
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'filter-high-price',
        name: 'High Price',
        description: 'Filter high-priced products',
        category: firstCategory,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'filter-low-price',
        name: 'Low Price',
        description: 'Filter low-priced products',
        category: firstCategory,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'filter-in-stock',
        name: 'In Stock',
        description: 'Filter products in stock',
        category: firstCategory,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'filter-out-of-stock',
        name: 'Out of Stock',
        description: 'Filter products out of stock',
        category: firstCategory,
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
    setSelectedCategory(categoryId);
    setSelectedFilter(null); // Reset filter when category changes
    
    // Load all filters when "ყველა" is clicked
    if (categoryId === null) {
      try {
        setFiltersLoading(true);
        const data = await filtersService.getActiveFilters();
        setFilters(data);
      } catch (err) {
        console.error('Error fetching all filters:', err);
        // Create example filters if there's an error
        const exampleFilters = createExampleFilters();
        setFilters(exampleFilters);
      } finally {
        setFiltersLoading(false);
      }
    }
  };

  const handleFilterSelect = async (filterId: string | null) => {
    setSelectedFilter(filterId);
    setProductsLoading(true);
    
    try {
      // Construct URL with filter parameter if selected
      const params = new URLSearchParams();
      
      if (selectedCategory) {
        params.append('category', selectedCategory);
      }
      
      if (filterId) {
        params.append('filter', filterId);
      }
      
      // Add price range parameters
      params.append('minPrice', priceRange[0].toString());
      params.append('maxPrice', priceRange[1].toString());
      
      const queryString = params.toString();
      const endpoint = queryString ? `/api/products?${queryString}` : '/api/products';
      
      const data = await api.get(endpoint, undefined, false);
      setProducts(data);
    } catch (err) {
      console.error('Error fetching filtered products:', err);
      setError('Failed to fetch filtered products');
    } finally {
      setProductsLoading(false);
    }
    
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
    <div className="container mx-auto px-4 py-4">
      {/* Horizontal Category Filter Navigation */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold mb-4 text-gray-500">კატეგორიები</h2>
        <div className="relative">
          <div className="flex overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="flex gap-2 min-w-max">
              <button
                onClick={() => handleCategorySelect(null)}
                className={`px-4 py-2 rounded-full transition-colors whitespace-nowrap ${
                  selectedCategory === null
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ყველა
              </button>
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => handleCategorySelect(category._id)}
                  className={`px-4 py-2 rounded-full transition-colors whitespace-nowrap ${
                    selectedCategory === category._id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white pointer-events-none"></div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Categories Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 mb-6 md:mb-0">
          <div className="bg-white rounded-lg shadow p-4">
            
            {/* Filters Section - Moved from horizontal navigation to sidebar */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">ფილტრები</h2>
              <div className="space-y-2">
                {filtersLoading ? (
                  <div className="animate-pulse space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-6 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : (
                  filters
                    .filter(filter => !selectedCategory || filter.category._id === selectedCategory)
                    .map((filter) => (
                      <div key={filter._id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`filter-${filter._id}`}
                          checked={selectedFilter === filter._id}
                          onChange={() => handleFilterSelect(selectedFilter === filter._id ? null : filter._id)}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`filter-${filter._id}`}
                          className="ml-2 block text-sm text-gray-700 cursor-pointer"
                        >
                          {filter.name}
                        </label>
                      </div>
                    ))
                )}
              </div>
            </div>
            
            {/* Price Range Filter */}
            <div className="pt-4 border-t border-gray-200">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">ფასი ₾</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <input
                    type="number"
                    name="min"
                    value={minPriceInput}
                    onChange={handlePriceInputChange}
                    className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm text-gray-800"
                    min={minPrice}
                    max={maxPrice}
                  />
                  <input
                    type="number"
                    name="max"
                    value={maxPriceInput}
                    onChange={handlePriceInputChange}
                    className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm text-gray-800"
                    min={minPrice}
                    max={maxPrice}
                  />
                </div>
                
                {/* Dual Handle Slider */}
                <div className="relative h-8" ref={sliderRef}>
                  {/* Track */}
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 rounded-full transform -translate-y-1/2"></div>
                  
                  {/* Selected Range */}
                  <div 
                    className="absolute top-1/2 h-1 bg-purple-500 rounded-full transform -translate-y-1/2"
                    style={{
                      left: `${minThumbPosition}%`,
                      width: `${maxThumbPosition - minThumbPosition}%`
                    }}
                  ></div>
                  
                  {/* Min Thumb */}
                  <div
                    ref={minThumbRef}
                    className="absolute top-1/2 w-4 h-4 bg-white border-2 border-purple-500 rounded-full transform -translate-y-1/2 cursor-pointer shadow-md"
                    style={{ left: `${minThumbPosition}%` }}
                    onMouseDown={(e) => handleThumbMouseDown(e, 'min')}
                  ></div>
                  
                  {/* Max Thumb */}
                  <div
                    ref={maxThumbRef}
                    className="absolute top-1/2 w-4 h-4 bg-white border-2 border-purple-500 rounded-full transform -translate-y-1/2 cursor-pointer shadow-md"
                    style={{ left: `${maxThumbPosition}%` }}
                    onMouseDown={(e) => handleThumbMouseDown(e, 'max')}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {selectedFilter && (
            <div className="mb-4 flex items-center">
              <span className="text-sm text-gray-600 mr-2">Filtered by:</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                {filters.find(f => f._id === selectedFilter)?.name || 'Filter'}
              </span>
              <button 
                onClick={() => handleFilterSelect(null)}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {productsLoading ? (
              // Show skeleton loaders while products are loading
              Array(6).fill(0).map((_, index) => (
                <ProductSkeleton key={index} />
              ))
            ) : (
              // Show actual products when loaded
              filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white rounded-lg shadow overflow-hidden cursor-pointer"
                    onClick={() => handleProductSelect(product)}
                  >
                    <div className="relative aspect-square">
                      <img
                        src={product.images[0] || 'https://via.placeholder.com/400'}
                        alt={product.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-gray-900 font-semibold">{product.price.toFixed(2)} ₾</p>
                      <h2 className="text-md text-gray-900 mb-2 line-clamp-2 overflow-hidden text-ellipsis">{product.name}</h2>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-gray-500">{product.seller?.businessName}</span>
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

      {/* Product Detail Panel */}
      <ProductDetailPanel
        product={selectedProduct}
        onClose={handlePanelClose}
      />
    </div>
  );
} 