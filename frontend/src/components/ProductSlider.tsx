'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { api } from '../utils/api';
import ProductDetailPanel from './ProductDetailPanel';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  seller: {
    businessName: string;
    _id: string;
    name: string;
  };
  category: {
    _id: string;
    name: string;
  };
  isActive: boolean;
  stock: number;
}

const ProductSlider = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Use public API endpoint for products
        const data = await api.get('/api/products', undefined, false);
        // Filter for featured products or take the first 6 products
        setProducts(data.slice(0, 6));
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  const handlePanelClose = () => {
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="py-10">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-600">გამორჩეული პროდუქტები</h2>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={30}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        breakpoints={{
          640: {
            slidesPerView: 2,
          },
          768: {
            slidesPerView: 3,
          },
          1024: {
            slidesPerView: 4,
          },
        }}
        className="product-swiper"
      >
        {products.map((product) => (
          <SwiperSlide key={product._id}>
            <div
              className="bg-white p-10 shadow-md overflow-hidden h-full flex flex-col cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleProductSelect(product)}
            >
              <div className="h-48 overflow-hidden">
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
              <div className="pt-5 flex-grow flex flex-col">
                <span className="text-gray-900 font-bold">${product.price.toFixed(2)}</span>
                <h3 className="text-md mb-2 text-gray-900 line-clamp-2 overflow-hidden text-ellipsis">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product?.seller?.businessName}</p>
                <div className="mt-auto flex justify-between items-center">
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Product Detail Panel */}
      <ProductDetailPanel
        product={selectedProduct}
        onClose={handlePanelClose}
      />
    </div>
  );
};

export default ProductSlider; 