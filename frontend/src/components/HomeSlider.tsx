'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Swiper as SwiperType } from 'swiper';
import { homeSliderService, type HomeSlider } from '../services/homeSliderService';
import { useRouter } from 'next/navigation';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// Custom styles for pagination dots
const customPaginationStyles = `
  .swiper-pagination {
    bottom: 20px !important;
    background: rgba(0, 0, 0, 0.6) !important;
    border-radius: 20px !important;
    padding: 8px 16px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
  }
  
  .swiper-pagination-bullet {
    width: 8px !important;
    height: 8px !important;
    background: rgba(255, 255, 255, 0.6) !important;
    border-radius: 50% !important;
    margin: 0 4px !important;
    transition: all 0.3s ease !important;
  }
  
  .swiper-pagination-bullet-active {
    background: rgba(255, 255, 255, 1) !important;
    transform: scale(1.2) !important;
  }
  .swiper-pagination-bullets{
    width: auto !important;
  }
`;

const HomeSlider = () => {
  const router = useRouter();
  const swiperRef = useRef<SwiperType>();
  const [sliders, setSliders] = useState<HomeSlider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        setLoading(true);
        const data = await homeSliderService.getHomeSliders();
        // Filter only active sliders and sort by order
        const activeSliders = data
          .filter(slider => slider.isActive)
          .sort((a, b) => a.order - b.order);
        setSliders(activeSliders);
      } catch (err) {
        console.error('Error fetching home sliders:', err);
        setError('Failed to load sliders');
      } finally {
        setLoading(false);
      }
    };

    fetchSliders();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[400px] sm:h-[250px] md:h-[300px] bg-gray-200 rounded-lg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[400px] sm:h-[250px] md:h-[300px] bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-600">Failed to load slider content</p>
      </div>
    );
  }

  if (sliders.length === 0) {
    return (
      <div className="w-full h-[400px] sm:h-[250px] md:h-[300px] bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-600">No slider content available</p>
      </div>
    );
  }

  const handleSliderClick = (slider: HomeSlider) => {
    if (slider.slug) {
      // If slug exists, navigate to the slug route
      router.push(`/${slider.slug}`);
    } else if (slider.categorySlug) {
      // If categorySlug exists, navigate to the category route
      router.push(`/products?category=${slider.categorySlug}`);
    }
    // If neither exists, do nothing (slider is not clickable)
  };

  return (
    <div className="w-full relative">
      <style jsx>{customPaginationStyles}</style>
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={30}
        centeredSlides={true}
        loop={sliders.length > 1}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={false}
        onBeforeInit={(swiper) => {
          swiperRef.current = swiper;
        }}
                 className="rounded-lg h-[400px] sm:h-[250px] md:h-[300px]"
      >
        {sliders.map((slider) => (
          <SwiperSlide key={slider._id}>
            <div 
              className={`relative h-full w-full ${(slider.slug || slider.categorySlug) ? 'cursor-pointer' : ''}`}
              onClick={() => handleSliderClick(slider)}
            >
              {/* Desktop Image */}
              <img
                src={slider.desktopImage}
                alt={slider.name}
                className="hidden md:block w-full h-full object-fill rounded-lg"
              />
              {/* Mobile Image */}
              <img
                src={slider.mobileImage}
                alt={slider.name}
                className="md:hidden w-full h-full object-fill rounded-lg"
              />
              {/* Click indicator */}
              {(slider.slug || slider.categorySlug) && (
                <div className="absolute top-4 right-4 bg-white bg-opacity-20 rounded-full p-2">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      
      {/* Custom Navigation Arrows - only show if more than one slide */}
      {sliders.length > 1 && (
        <>
          <button
            onClick={() => swiperRef.current?.slidePrev()}
            className="hidden md:flex absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-black/60 hover:bg-black/80 rounded-full items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
            aria-label="Previous slide"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>
          
          <button
            onClick={() => swiperRef.current?.slideNext()}
            className="hidden md:flex absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-black/60 hover:bg-black/80 rounded-full items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
            aria-label="Next slide"
          >
            <ChevronRight size={20} className="text-white" />
          </button>
        </>
      )}
    </div>
  );
};

export default HomeSlider; 