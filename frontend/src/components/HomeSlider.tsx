'use client';

import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Swiper as SwiperType } from 'swiper';
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
  const swiperRef = useRef<SwiperType>();

  return (
    <div className="w-full relative">
      <style jsx>{customPaginationStyles}</style>
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={30}
        centeredSlides={true}
        loop={true}
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
        className="rounded-lg h-[300px]"
      >
        <SwiperSlide>
          <div className="relative h-full bg-gray-200 backdrop-blur-lg flex items-center justify-center">
            <span className="text-8xl">🛍️</span>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="relative h-full bg-green-200 backdrop-blur-lg flex items-center justify-center">
            <span className="text-8xl">🎁</span>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="relative h-full bg-blue-200 backdrop-blur-lg flex items-center justify-center">
            <span className="text-8xl">💎</span>
          </div>
        </SwiperSlide>
      </Swiper>
      
      {/* Custom Navigation Arrows */}
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
    </div>
  );
};

export default HomeSlider; 