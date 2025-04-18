'use client';

import { useState, useEffect, useRef } from 'react';
import ProductDetailPanel from '../../components/ProductDetailPanel';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../utils/api';

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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category') || null
  );
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  
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

  // Fetch products based on selected category
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        
        // Construct URL with category filter if selected
        const endpoint = selectedCategory
          ? `/api/products?category=${selectedCategory}`
          : '/api/products';
        
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
  }, [selectedCategory]);

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

  // Filter products by price range
  const filteredProducts = products.filter(product => {
    return product.price >= priceRange[0] && product.price <= priceRange[1];
  });

  // Handle price input change
  const handlePriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (e.target.name === 'min') {
      setMinPriceInput(value);
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue <= priceRange[1]) {
        setPriceRange([numValue, priceRange[1]]);
      }
    } else {
      setMaxPriceInput(value);
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue >= priceRange[0]) {
        setPriceRange([priceRange[0], numValue]);
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
      
      if (isDragging === 'min') {
        // Ensure min doesn't exceed max
        if (priceValue <= priceRange[1]) {
          setPriceRange([priceValue, priceRange[1]]);
          setMinPriceInput(priceValue.toString());
        }
      } else {
        // Ensure max doesn't go below min
        if (priceValue >= priceRange[0]) {
          setPriceRange([priceRange[0], priceValue]);
          setMaxPriceInput(priceValue.toString());
        }
      }
    };
    
    const handleMouseUp = () => {
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
  }, [isDragging, minPrice, maxPrice, priceRange]);

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

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 mt-8 text-gray-600">პროდუქტები</h1>

      <div className="flex gap-8">
        {/* Categories Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">კატეგორიები</h2>
            <div className="space-y-2">
              <button
                onClick={() => handleCategorySelect(null)}
                className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                  selectedCategory === null
                    ? 'bg-purple-100 text-purple-700'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                ყველა ({allProducts.length})
              </button>
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => handleCategorySelect(category._id)}
                  className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                    selectedCategory === category._id
                      ? 'bg-purple-100 text-purple-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {category.name} ({category.productCount || 0})
                </button>
              ))}
            </div>
            
            {/* Price Range Filter */}
            <div className="mt-8 pt-4 border-t border-gray-200">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {productsLoading ? (
              // Show skeleton loaders while products are loading
              Array(6).fill(0).map((_, index) => (
                <ProductSkeleton key={index} />
              ))
            ) : (
              // Show actual products when loaded
              filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-whitecursor-pointer"
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
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h2>
                    <p className="text-purple-600 font-semibold">{product.price.toFixed(2)} ₾</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-gray-500">{product.category.name}</span>
                      <span className="text-sm text-gray-500">{product.seller.name}</span>
                    </div>
                  </div>
                </div>
              ))
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