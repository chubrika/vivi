'use client';

import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Swiper as SwiperType } from 'swiper';
import { useRouter } from 'next/navigation';
import { useHomeSliders, type HomeSlider } from '../hooks/useHomeSliders';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// Custom styles for Rakuten-style slider
const customSliderStyles = `
  .rakuten-swiper {
    padding-left: 0 !important;
    padding-right: 0 !important;
    overflow: hidden !important;
  }
  
  .rakuten-swiper .swiper-wrapper {
    align-items: flex-start !important;
  }
  
  .rakuten-swiper .swiper-slide {
    width: 85% !important;
    margin-right: 20px !important;
    transition: all 0.3s ease !important;
    overflow: hidden !important;
  }
  
  .rakuten-swiper .swiper-slide:first-child {
    margin-left: 0 !important;
  }
  
  .rakuten-swiper .swiper-slide-active {
    z-index: 2 !important;
  }
  
  .rakuten-swiper .swiper-slide-next {
    opacity: 0.8 !important;
  }
  
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
  
  .swiper-pagination-bullets {
    width: auto !important;
  }
  
  @media (max-width: 768px) {
    .rakuten-swiper .swiper-slide {
      width: 85% !important;
      margin-right: 5px !important;
    }
    
    .swiper-pagination {
      display: none !important;
    }
  }
  
  @media (max-width: 480px) {
    .rakuten-swiper .swiper-slide {
      width: 85% !important;
      margin-right: 5px !important;
    }
    
    .swiper-pagination {
      bottom: 10px !important;
      padding: 4px 10px !important;
    }
  }
`;

const HomeSlider = () => {
  const router = useRouter();
  const swiperRef = useRef<SwiperType>();
  const { sliders, isLoading, error } = useHomeSliders();

  if (isLoading) {
    return (
      <div className="w-full h-[200px] sm:h-[180px] md:h-[300px] bg-gray-200 rounded-lg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[200px] sm:h-[180px] md:h-[300px] bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-600">Failed to load slider content</p>
      </div>
    );
  }

  if (sliders.length === 0) {
    return (
      <div className="w-full h-[200px] sm:h-[180px] md:h-[300px] bg-gray-200 rounded-lg flex items-center justify-center">
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
    <div className="w-full relative overflow-hidden">
      <style jsx>{customSliderStyles}</style>
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={0}
        slidesPerView="auto"
        centeredSlides={false}
        loop={sliders.length > 1}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={false}
        onBeforeInit={(swiper) => {
          swiperRef.current = swiper;
        }}
        className="rakuten-swiper h-[200px] sm:h-[180px] md:h-[300px]"
        breakpoints={{
          320: {
            slidesPerView: 'auto',
            spaceBetween: 10,
            centeredSlides: false,
          },
          768: {
            slidesPerView: 'auto',
            spaceBetween: 20,
            centeredSlides: false,
          },
          1024: {
            slidesPerView: 'auto',
            spaceBetween: 20,
            centeredSlides: false,
          },
        }}
      >
        {sliders.map((slider) => (
          <SwiperSlide key={slider._id}>
            <div 
              className={`relative h-full w-full rounded-lg overflow-hidden shadow-lg ${(slider.slug || slider.categorySlug) ? 'cursor-pointer' : ''}`}
              onClick={() => handleSliderClick(slider)}
            >
              {/* Desktop Image */}
              <img
                src={slider.desktopImage}
                alt={slider.name}
                className="hidden md:block w-full h-full object-cover"
              />
              {/* Mobile Image */}
              <img
                src={slider.mobileImage}
                alt={slider.name}
                className="md:hidden w-full h-full object-cover"
              />
              
              {/* Gradient overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
              
              {/* Click indicator */}
              {(slider.slug || slider.categorySlug) && (
                <div className="absolute top-4 right-4 bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-2 hover:bg-opacity-30 transition-all duration-200">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              )}
              
              {/* Optional: Add text overlay */}
              {/* <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-lg font-semibold drop-shadow-lg">{slider.name}</h3>
              </div> */}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      
      {/* Custom Navigation Arrows - only show if more than one slide */}
      {sliders.length > 1 && (
        <>
          <button
            onClick={() => swiperRef.current?.slidePrev()}
            className="hidden md:flex absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-black/60 hover:bg-black/80 rounded-full items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 backdrop-blur-sm"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} className="text-white" />
          </button>
          
          <button
            onClick={() => swiperRef.current?.slideNext()}
            className="hidden md:flex absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-black/60 hover:bg-black/80 rounded-full items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 backdrop-blur-sm"
            aria-label="Next slide"
          >
            <ChevronRight size={24} className="text-white" />
          </button>
        </>
      )}
    </div>
  );
};

export default HomeSlider; 