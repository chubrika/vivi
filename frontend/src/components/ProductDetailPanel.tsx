'use client';

import { useState, useEffect } from 'react';
import AddToCartButton from './AddToCartButton';
import { useRouter } from 'next/navigation';
import { useAuth } from '../utils/authContext';
import { useCart } from '../utils/cartContext';
import { Product } from '../types/product';
import { ShoppingCart } from 'lucide-react';

interface FeatureValue {
    type: number;
    featureValue: string;
}

interface Feature {
    featureId: number;
    featureCaption: string;
    featureValues: FeatureValue[];
}

interface ProductDetailPanelProps {
    product: Product | null;
    onClose: () => void;
}

export default function ProductDetailPanel({ product, onClose }: ProductDetailPanelProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const router = useRouter();
    const { user } = useAuth();
    const { addItem, totalItems } = useCart();
    const isSeller = user?.role === 'seller';
    const isCourier = user?.role === 'courier';

    // Handle body scroll lock when panel is open
    useEffect(() => {
        if (product) {
            setIsVisible(true);
            // Disable body scroll
            document.body.style.overflow = 'hidden';
        } else {
            setIsVisible(false);
            // Re-enable body scroll
            document.body.style.overflow = 'auto';
        }

        // Clean up function to ensure body scroll is re-enabled when component unmounts
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [product]);

    // Reset active image index when product changes
    useEffect(() => {
        if (product) {
            setActiveImageIndex(0);
        }
    }, [product]);

    if (!product) return null;

    // Handle image click to set as main image
    const handleImageClick = (index: number) => {
        setActiveImageIndex(index);
    };

    // Handle Buy Now click
    const handleBuyNow = () => {
        if (product) {
            // Close the panel
            onClose();
            // Navigate to checkout page with product ID and quantity
            router.push(`/checkout?productId=${product._id}&quantity=${quantity}`);
        }
    };

    // Handle quantity change
    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (value > 0 && value <= (product?.stock || 1)) {
            setQuantity(value);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed z-[51] inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'
                    }`}
                onClick={onClose}
            />

            {/* Panel */}
            <div
                className={`fixed z-[52] right-0 top-0 h-full w-full md:w-[75%] bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="h-full overflow-y-auto">
                    {/* Non-fixed Header */}
                    <div className="bg-white border-b border-gray-200 fixed w-full z-10">
                        <div className="flex justify-between items-center p-4 md:px-[30px]">
                            <p className="text-black text-lg font-bold">{product.name}</p>
                            <div className="flex items-center gap-4">
                                {!isSeller && !isCourier && (
                                    <button
                                        onClick={() => {
                                            router.push('/cart');
                                        }}
                                        className="relative"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition duration-300">
                                            <ShoppingCart className="h-5 w-5" />
                                            {totalItems > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                                    {totalItems}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 md:p-8 md:px-[20px] lg:px-[20px] py-12">
                        {/* Main content area with flex layout */}
                        <div className="flex flex-col md:flex-row gap-2 md:gap-4 pt-12">
                            {/* Image Gallery */}
                            <div className="w-full md:w-2/5">
                                <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                                    <img
                                        src={product.images[activeImageIndex] || 'https://via.placeholder.com/400'}
                                        alt={product.name}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                                {product.images.length > 1 && (
                                    <div className="flex flex-wrap gap-4 mt-4">
                                        {product.images.map((image, index) => (
                                            <div
                                                key={index}
                                                className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer w-10 h-10 ${index === activeImageIndex ? 'ring-2 ring-purple-500' : ''
                                                    }`}
                                                onClick={() => handleImageClick(index)}
                                            >
                                                <img
                                                    src={image}
                                                    alt={`${product.name} ${index + 1}`}
                                                    className="object-cover w-full h-full"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div className="w-full md:w-2/5">
                                <div className="border-b border-gray-200 py-3">
                                    <h2 className="text-sm font-semibold text-gray-900">მაღაზია</h2>
                                    <p className="text-gray-600 text-sm">
                                        {typeof product.seller === 'object' 
                                            ? (product.seller.businessName || product.seller.name || 'Unknown Seller')
                                            : 'Unknown Seller'
                                        }
                                    </p>
                                </div>

                                <div>
                                    <h2 className="text-md font-semibold text-gray-900">აღწერა</h2>
                                    <div
                                        className={`mt-2 text-gray-600 text-sm ${!showFullDescription ? 'line-clamp-4' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: product.description }}
                                    />
                                    <button
                                        className="mt-2 text-purple-600 hover:text-purple-700"
                                        onClick={() => setShowFullDescription(!showFullDescription)}
                                    >
                                        {showFullDescription ? 'ნაკლების ნახვა' : 'მეტის ნახვა'}
                                    </button>
                                </div>
                            </div>

                            {/* Price and Actions */}
                            <div className="w-full md:w-1/5 border border-gray-200 p-3">
                                {/* Price */}
                                <div>
                                    <p className="text-2xl font-semibold text-purple-600">
                                        {product.price.toFixed(2)} ₾
                                    </p>
                                </div>

                                {/* Quantity Input */}
                                <div className="flex items-center justify-between mt-4">
                                    <h2 className="text-sm font-semibold text-gray-900">რაოდენობა</h2>
                                    <div className="flex items-center">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-purple-600"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        <input
                                            type="number"
                                            min="1"
                                            max={product.stock}
                                            value={quantity}
                                            onChange={handleQuantityChange}
                                            className="w-16 text-center text-gray-600 bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                        <button
                                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-purple-600"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Add to Cart Button */}
                                <div className="w-full border-t border-gray-200 mt-4">
                                    {!isSeller && !isCourier ? (
                                        <>
                                            <div className="pt-4 flex gap-4">
                                                <button
                                                    onClick={handleBuyNow}
                                                    className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    ყიდვა
                                                </button>
                                            </div>
                                            <div className="pt-4 flex gap-4">
                                                <AddToCartButton product={product} quantity={quantity} />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="pt-4">
                                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                                                <div className="flex">
                                                    <div className="flex-shrink-0">
                                                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="text-sm text-yellow-700">
                                                            მხოლოდ ჩვეულებრივ იუზერს შეუძლია პროდუქტის ყიდვა ან კალათაში დამატება
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            {/* Product Features Section */}
                            {product.productFeatureValues && product.productFeatureValues.length > 0 && (
                                <div className="mt-8 pt-8 border-t border-gray-200">
                                    <div className="space-y-6">
                                        {product.productFeatureValues.map((group, groupIndex) => (
                                            <div key={groupIndex} className="bg-gray-50 rounded-lg p-3">
                                                <h3 className="text-xl font-bold text-gray-800 mb-4">
                                                    {group.featureGroupCaption}
                                                </h3>
                                                <div className="space-y-3">
                                                    {group.features.map((feature, featureIndex) => (
                                                        <div key={featureIndex} className="flex justify-between items-start">
                                                            <h4 className="text-sm font-medium text-gray-700">
                                                                {feature.featureCaption}
                                                            </h4>
                                                            <div className="text-right">
                                                                {feature.featureValues.map((value, valueIndex) => (
                                                                    <div key={valueIndex} className="text-sm text-gray-600">
                                                                        {value.featureValue}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
} 