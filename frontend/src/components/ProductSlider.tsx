'use client';

import { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useFeaturedProducts } from '@/src/hooks/useFeaturedProducts';
import ProductDetailPanel from './ProductDetailPanel';
import { Product } from '../types/product';

interface ProductSliderProps {
  title?: string;
}

const ProductSlider = ({ title = "Featured Products" }: ProductSliderProps) => {
  const { products, isLoading, error } = useFeaturedProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const swiperRef = useRef<SwiperType>();
  const [showArrows, setShowArrows] = useState(false);

  // Function to check if arrows should be shown
  const checkShowArrows = () => {
    if (!swiperRef.current) return;
    
    const swiper = swiperRef.current;
    const slidesPerView = swiper.params.slidesPerView as number;
    const totalSlides = products.length;
    
    // Show arrows only if there are more slides than can be displayed
    setShowArrows(totalSlides > slidesPerView);
  };

  // Effect to check arrows visibility when products change or window resizes
  useEffect(() => {
    checkShowArrows();
    
    const handleResize = () => {
      checkShowArrows();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [products]);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  const handlePanelClose = () => {
    setSelectedProduct(null);
  };

  // Helper function to check if product has an active discount
  const hasActiveDiscount = (product: Product) => {
    if (!product.discountedPercent || !product.discountedPrice) return false;
    
    const now = new Date();
    const startDate = product.discountStartDate ? new Date(product.discountStartDate) : null;
    const endDate = product.discountEndDate ? new Date(product.discountEndDate) : null;
    
    // If no dates are set, assume discount is always active
    if (!startDate && !endDate) return true;
    
    // Check if current date is within discount period
    if (startDate && endDate) {
      return now >= startDate && now <= endDate;
    } else if (startDate) {
      return now >= startDate;
    } else if (endDate) {
      return now <= endDate;
    }
    
    return false;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p>{error.message ?? 'Failed to load products'}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-10">
        <span className="text-black">
          {title}
        </span>
      </h2>
      <div className="relative">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={10}
          slidesPerView={1}
          navigation={false}
          pagination={false}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          onBeforeInit={(swiper) => {
            swiperRef.current = swiper;
          }}
          onAfterInit={() => {
            checkShowArrows();
          }}
          onBreakpoint={() => {
            checkShowArrows();
          }}
          breakpoints={{
            320: {
              slidesPerView: 2,
              spaceBetween: 10,
            },
            640: {
              slidesPerView: 2,
              spaceBetween: 10,
            },
            768: {
              slidesPerView: 4,
              spaceBetween: 15,
            },
            1024: {
              slidesPerView: 6,
              spaceBetween: 15,
            },
          }}
          className="product-swiper"
        >
        {products.map((product) => {
          const isDiscounted = hasActiveDiscount(product);
          
          return (
            <SwiperSlide key={product._id}>
              <div
                                 className="bg-white p-2 md:p-5 shadow-md overflow-hidden h-full flex flex-col cursor-pointer hover:shadow-lg transition-shadow relative"
                onClick={() => handleProductSelect(product)}
              >
                {/* Discount Ribbon */}
                {isDiscounted && product.discountedPercent && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 z-10 rounded-bl-lg">
                    -{product.discountedPercent}%
                  </div>
                )}
                
                                 <div className="h-32 md:h-48 overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>
                                 <div className="pt-2 md:pt-5 flex-grow flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    {isDiscounted && product.discountedPrice ? (
                      <>
                        <span className="text-gray-900 font-bold text-sm md:text-lg">
                          {product.discountedPrice.toFixed(2)} ₾
                        </span>
                        <span className="text-gray-500 line-through text-xs md:text-sm">
                          {product.price.toFixed(2)} ₾
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-900 font-bold text-sm md:text-lg">
                        {product.price.toFixed(2)} ₾
                      </span>
                    )}
                  </div>
                                     <h3 className="text-sm md:text-md mb-1 md:mb-2 text-gray-900 line-clamp-2 overflow-hidden text-ellipsis">{product.name}</h3>
                                     <p className="text-gray-600 text-xs md:text-sm mb-1 md:mb-2 line-clamp-2">
                    {typeof product.seller === 'object' && product.seller !== null ? product.seller.storeName : 'unknown seller'}
                  </p>
                  <div className="mt-auto flex justify-between items-center">
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
        </Swiper>
        
        {/* Custom Navigation Arrows */}
        {showArrows && (
          <>
            <button
              onClick={() => swiperRef.current?.slidePrev()}
              className="hidden md:flex absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-white/80 hover:bg-white rounded-full items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
              aria-label="Previous slide"
            >
              <ChevronLeft size={20} className="text-gray-700" />
            </button>
            
            <button
              onClick={() => swiperRef.current?.slideNext()}
              className="hidden md:flex absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-white/80 hover:bg-white rounded-full items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
              aria-label="Next slide"
            >
              <ChevronRight size={20} className="text-gray-700" />
            </button>
          </>
        )}
      </div>

      {/* Product Detail Panel */}
      <ProductDetailPanel
        product={selectedProduct}
        onClose={handlePanelClose}
      />
    </div>
  );
};

export default ProductSlider; 