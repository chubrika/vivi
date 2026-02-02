'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { api } from '@/src/utils/api';
import { categoriesService } from '@/src/services/categoriesService';
import { filtersService } from '@/src/services/filtersService';
import type { Filter } from '@/src/services/filtersService';
import { Product } from '@/src/types/product';
import { Category } from '@/src/types/category';

type FilterLike = { _id: string; name: string; slug: string; type: string; config?: { options?: string[] } };
import CategoryNavigation from '@/src/components/CategoryNavigation';
import AddToCartButton from '@/src/components/AddToCartButton';
import RangeSlider from '@/src/components/RangeSlider';
import { getCloudinaryThumbnail } from '@/src/utils/cloudinaryUrl';
import ProductDetailPanel from '@/src/components/ProductDetailPanel';

const ProductSkeleton = () => (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <div className="relative aspect-square bg-gray-200 animate-pulse" />
    <div className="p-4">
      <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
      <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
      <div className="mt-2 flex items-center justify-between">
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  </div>
);

export interface ProductsLayoutClientProps {
  initialProducts: Product[];
  initialCategories: Category[];
  initialFilters: Filter[] | FilterLike[];
  categorySlug: string | null;
  categoryName?: string;
}

export default function ProductsLayoutClient({
  initialProducts,
  initialCategories,
  initialFilters,
  categorySlug,
  categoryName,
}: ProductsLayoutClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams() ?? new URLSearchParams();

  const pathSegments = pathname?.split('/').filter(Boolean) ?? [];
  const categoryFromPath =
    pathSegments[0] === 'products' &&
    pathSegments[1] &&
    pathSegments[1] !== 'product'
      ? pathSegments[1]
      : null;

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [filters, setFilters] = useState<Filter[] | FilterLike[]>(initialFilters);
  const [expandedFilters, setExpandedFilters] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categorySlug ?? categoryFromPath);
  const [productsLoading, setProductsLoading] = useState(false);
  const [filtersLoading, setFiltersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [minPriceInput, setMinPriceInput] = useState('0');
  const [maxPriceInput, setMaxPriceInput] = useState('1000');
  const [selectedColors, setSelectedColors] = useState<Record<string, string[]>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const lastParamsRef = useRef<string | null>(null);
  const allProductsFetchedRef = useRef(false);

  const basePath = categoryFromPath ? `/products/${categoryFromPath}` : '/products';

  useEffect(() => {
    setSelectedCategory(categoryFromPath ?? categorySlug ?? null);
  }, [categoryFromPath, categorySlug]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryFromPath) params.set('category', categoryFromPath);
    const queryString = params.toString();
    if (lastParamsRef.current === queryString) return;
    lastParamsRef.current = queryString;

    const doFetch = async () => {
      try {
        setProductsLoading(true);
        const endpoint = queryString ? `/api/products?${queryString}` : '/api/products';
        const data = await api.get(endpoint, undefined, false);
        setProducts(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to fetch products');
      } finally {
        setProductsLoading(false);
      }
    };
    doFetch();
  }, [searchParams, categoryFromPath]);

  useEffect(() => {
    const prices = allProducts.length
      ? allProducts.map((p) => p.price)
      : initialProducts.map((p) => p.price);
    if (prices.length) {
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      setMinPrice(min);
      setMaxPrice(max);
      setPriceRange([min, max]);
      setMinPriceInput(String(min));
      setMaxPriceInput(String(max));
    }
  }, [allProducts, initialProducts]);

  useEffect(() => {
    if (allProductsFetchedRef.current) return;
    allProductsFetchedRef.current = true;
    api.get('/api/products', undefined, false).then((data) => {
      setAllProducts(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (allProducts.length === 0) return;
    const counts = allProducts.reduce((acc, p) => {
      const id = typeof p.category === 'object' && p.category ? (p.category as { _id: string })._id : p.category;
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    setCategories((prev) =>
      prev.map((c) => ({ ...c, productCount: counts[c._id] || 0 }))
    );
  }, [allProducts]);

  useEffect(() => {
    let mounted = true;
    setFiltersLoading(true);
    filtersService.getFiltersForProducts(categoryFromPath ?? null).then((data) => {
      if (mounted) setFilters(Array.isArray(data) ? data : []);
    }).catch(() => {
      if (mounted) setFilters(initialFilters);
    }).finally(() => {
      if (mounted) setFiltersLoading(false);
    });
    return () => { mounted = false; };
  }, [categoryFromPath]);

  const buildPathWithQuery = (category: string | null) => {
    const path = category ? `/products/${category}` : '/products';
    const q = searchParams.toString();
    return q ? `${path}?${q}` : path;
  };

  const handleCategorySelect = (slug: string | null) => {
    const path = slug ? `/products/${slug}` : '/products';
    const q = searchParams.toString();
    router.push(q ? `${path}?${q}` : path, { scroll: false });
    setIsSidebarOpen(false);
  };

  const handlePriceRangeApply = useCallback(async (newRange: [number, number]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryFromPath) params.set('category', categoryFromPath);
    params.set('minPrice', String(newRange[0]));
    params.set('maxPrice', String(newRange[1]));
    router.push(`${basePath}?${params.toString()}`, { scroll: false });
  }, [searchParams, categoryFromPath, basePath, router]);

  const handleRangeSliderChange = useCallback((newRange: [number, number]) => {
    setPriceRange(newRange);
    setMinPriceInput(String(newRange[0]));
    setMaxPriceInput(String(newRange[1]));
  }, []);

  const handleRangeSliderMouseUp = useCallback(() => {
    handlePriceRangeApply(priceRange);
  }, [priceRange, handlePriceRangeApply]);

  const handlePriceInputBlur = () => {
    const minVal = parseFloat(minPriceInput) || minPrice;
    const maxVal = parseFloat(maxPriceInput) || maxPrice;
    const validMin = Math.max(minPrice, Math.min(maxPrice, minVal));
    const validMax = Math.max(minPrice, Math.min(maxPrice, Math.max(validMin, maxVal)));
    setPriceRange([validMin, validMax]);
    setMinPriceInput(String(validMin));
    setMaxPriceInput(String(validMax));
    handlePriceRangeApply([validMin, validMax]);
  };

  const toggleFilterExpansion = (slug: string) => {
    setExpandedFilters((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  const handleColorSelect = (filterSlug: string, color: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryFromPath) params.set('category', categoryFromPath);
    const current = selectedColors[filterSlug] || [];
    const next = current.includes(color) ? current.filter((c) => c !== color) : [...current, color];
    if (next.length) params.set(filterSlug, next.join(','));
    else params.delete(filterSlug);
    router.push(`${basePath}?${params.toString()}`, { scroll: false });
  };

  const handleOptionSelect = (filterSlug: string, option: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryFromPath) params.set('category', categoryFromPath);
    const current = selectedOptions[filterSlug] || [];
    const next = current.includes(option) ? current.filter((o) => o !== option) : [...current, option];
    if (next.length) params.set(filterSlug, next.join(','));
    else params.delete(filterSlug);
    router.push(`${basePath}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const nextColors: Record<string, string[]> = {};
    const nextOptions: Record<string, string[]> = {};
    searchParams.forEach((value, key) => {
      const filter = filters.find((f) => f.slug === key);
      if (filter) {
        const values = value.split(',');
        if (filter.type === 'color') nextColors[key] = values;
        else if (filter.type === 'select') nextOptions[key] = values;
      }
    });
    setSelectedColors(nextColors);
    setSelectedOptions(nextOptions);
  }, [searchParams, filters]);

  const handleClearAllFilters = () => {
    const path = categoryFromPath ? `/products/${categoryFromPath}` : '/products';
    router.push(path, { scroll: false });
  };

  // Handle opening product detail panel
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    // Update URL without full navigation (for browser history and sharing)
    window.history.pushState(null, '', `/products/product/${product._id}`);
  };

  // Handle closing product detail panel
  const handleCloseProductPanel = () => {
    setSelectedProduct(null);
    // Restore the previous URL
    const path = categoryFromPath ? `/products/${categoryFromPath}` : '/products';
    const q = searchParams.toString();
    window.history.pushState(null, '', q ? `${path}?${q}` : path);
  };

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      // Check if current URL is a product detail page
      const productMatch = window.location.pathname.match(/\/products\/product\/([^/]+)/);
      if (productMatch) {
        // Find and show the product
        const productId = productMatch[1];
        const product = products.find(p => p._id === productId) || allProducts.find(p => p._id === productId);
        if (product) {
          setSelectedProduct(product);
        } else {
          // Fetch the product if not in current lists
          api.get(`/api/products/${productId}`, undefined, false)
            .then(data => setSelectedProduct(data))
            .catch(() => setSelectedProduct(null));
        }
      } else {
        setSelectedProduct(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [products, allProducts]);

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  const pageTitle = categoryName ?? 'პროდუქტები';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:hidden bg-white shadow-sm border-b">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-sm md:text-lg font-semibold text-gray-900">{pageTitle}</h1>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center space-x-2 px-3 py-2 text-sky-600 rounded-md font-semibold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span className="text-sm md:text-base">ფილტრი</span>
          </button>
        </div>
      </div>

      <div className="flex">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div
          className={`fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white shadow-lg lg:shadow-none transform transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } lg:inset-y-auto lg:left-auto lg:z-auto`}
        >
          <CategoryNavigation
            categories={categories}
            selectedCategorySlug={selectedCategory}
            onCategorySelect={handleCategorySelect}
          />

          <h2 className="text-[14px] font-semibold text-gray-900 hidden md:block">ფილტრი</h2>
          <div className="h-full overflow-y-auto md:pt-4 pt-0">
            <div className="flex items-center justify-between lg:hidden">
              <h2 className="text-[14px] pl-4 font-semibold text-gray-900">ფილტრი</h2>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {filters.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4 border">
                <h3 className="text-sm font-medium text-gray-900 mb-4">ფასი</h3>
                <div className="space-y-4 pb-4 border-b border-gray-200">
                  <RangeSlider
                    min={minPrice}
                    max={maxPrice}
                    value={priceRange}
                    onChange={handleRangeSliderChange}
                    onMouseUp={handleRangeSliderMouseUp}
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      name="minPrice"
                      value={minPriceInput}
                      onChange={(e) => setMinPriceInput(e.target.value)}
                      onBlur={handlePriceInputBlur}
                      className="w-full text-[18px] font-semibold text-gray-900 px-3 pr-8 py-2 border border-gray-300 rounded-md text-sm"
                      min={minPrice}
                      max={maxPrice}
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      name="maxPrice"
                      value={maxPriceInput}
                      onChange={(e) => setMaxPriceInput(e.target.value)}
                      onBlur={handlePriceInputBlur}
                      className="w-full text-[18px] font-semibold text-gray-900 px-3 pr-8 py-2 border border-gray-300 rounded-md text-sm"
                      min={minPrice}
                      max={maxPrice}
                    />
                  </div>
                </div>
                {filtersLoading ? (
                  <div className="animate-pulse space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-6 bg-gray-200 rounded" />
                    ))}
                  </div>
                ) : (
                  filters.map((filter) => (
                    <div key={filter._id} className="border-b border-gray-200 overflow-hidden">
                      <button
                        onClick={() => toggleFilterExpansion(filter.slug)}
                        className="w-full flex items-center justify-between pt-3 pb-3 hover:bg-gray-50"
                      >
                        <h3 className="text-sm font-medium text-gray-900">{filter.name}</h3>
                        <svg
                          className={`w-5 h-5 text-gray-500 transform transition-transform ${expandedFilters[filter.slug] ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div className={`overflow-hidden transition-all ${expandedFilters[filter.slug] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="p-3 pt-0">
                          {filter.type === 'color' && filter.config?.options?.map((color) => (
                            <button
                              key={color}
                              className={`w-8 h-8 rounded-full border-2 mx-1 ${
                                selectedColors[filter.slug]?.includes(color) ? 'border-sky-500' : 'border-gray-200'
                              }`}
                              style={{ backgroundColor: color }}
                              onClick={() => handleColorSelect(filter.slug, color)}
                            />
                          ))}
                          {filter.type === 'select' && filter.config?.options?.map((option) => (
                            <div key={option} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`${filter.slug}-${option}`}
                                checked={selectedOptions[filter.slug]?.includes(option) ?? false}
                                onChange={() => handleOptionSelect(filter.slug, option)}
                                className="h-4 w-4 text-sky-600 rounded"
                              />
                              <label htmlFor={`${filter.slug}-${option}`} className="ml-2 text-sm">{option}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="p-4 lg:p-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-2 lg:gap-6">
              {productsLoading ? (
                Array(10).fill(0).map((_, i) => <ProductSkeleton key={i} />)
              ) : products.length > 0 ? (
                products.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white rounded-lg transition-all overflow-hidden shadow-sm hover:shadow-md flex flex-col justify-between"
                  >
                    <div 
                      className="block cursor-pointer"
                      onClick={() => handleProductClick(product)}
                    >
                      <div className="relative aspect-square">
                        <img
                          src={getCloudinaryThumbnail(product.images[0])}
                          alt={product.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="p-3 sm:p-4 relative">
                        {product.discountedPercent && product.discountedPercent > 0 && (
                          <div className="absolute top-2 right-2 z-10">
                            <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">-{product.discountedPercent}%</div>
                          </div>
                        )}
                        <div className="mb-2">
                          {product.discountedPrice && product.discountedPrice > 0 ? (
                            <div className="flex items-center gap-2">
                              <p className="text-gray-900 font-semibold text-sm sm:text-base">{product.discountedPrice.toFixed(2)} ₾</p>
                              <p className="text-gray-500 text-xs line-through">{product.price.toFixed(2)} ₾</p>
                            </div>
                          ) : (
                            <p className="text-gray-900 font-semibold text-sm sm:text-base">{product.price.toFixed(2)} ₾</p>
                          )}
                        </div>
                        <h2 className="text-xs sm:text-sm text-gray-900 mb-2 line-clamp-2">{product.name}</h2>
                        <span className="text-xs text-gray-500 truncate block">
                          {typeof product.seller === 'object' && product.seller !== null ? product.seller.storeName : ''}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 pt-0" onClick={(e) => e.stopPropagation()}>
                      <AddToCartButton product={product} className="text-xs py-1.5 px-2" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 text-[16px] font-semibold">მითითებული მონაცემებით პროდუქტები ვერ მოიძებნა</p>
                  <button
                    onClick={handleClearAllFilters}
                    className="mt-4 px-4 py-2 border border-gray-300 text-gray-600 rounded-md hover:bg-sky-100"
                  >
                    ფილტრის გასუფთავება
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product Detail Panel */}
      <ProductDetailPanel
        product={selectedProduct}
        onClose={handleCloseProductPanel}
      />
    </div>
  );
}
