'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const HomeSlider = () => {
  return (
    <div className="w-full">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={30}
        centeredSlides={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={true}
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
    </div>
  );
};

export default HomeSlider; 