'use client';

import { useState, useEffect } from 'react';
import AddToCartButton from './AddToCartButton';
import { useRouter } from 'next/navigation';

interface FeatureValue {
    type: number;
    featureValue: string;
}

interface Feature {
    featureId: number;
    featureCaption: string;
    featureValues: FeatureValue[];
}

interface FeatureGroup {
    featureGroupId: number;
    featureGroupCaption: string;
    features: Feature[];
}

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
    productFeatureValues?: FeatureGroup[];
}

interface ProductDetailPanelProps {
    product: Product | null;
    onClose: () => void;
}

export default function ProductDetailPanel({ product, onClose }: ProductDetailPanelProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const router = useRouter();

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

        // Cleanup function to ensure body scroll is re-enabled when component unmounts
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
            // Navigate to checkout page with product ID
            router.push(`/checkout?productId=${product._id}`);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'
                    }`}
                onClick={onClose}
            />

            {/* Panel */}
            <div
                className={`fixed right-0 top-0 h-full w-[75%] bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="h-full overflow-y-auto">
                    {/* Non-fixed Header */}
                    <div className="bg-white border-b border-gray-200 fixed w-full z-10">
                        <div className="flex justify-between items-center p-4 md:px-[30px]">
                            <h1 className="text-xl font-bold text-gray-900">პროდუქტის დეტალები</h1>
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

                    {/* Content */}
                    <div className="p-8 md:px-[100px] lg:px-[100px] py-12">
                        {/* Main content area with flex layout */}
                        <h1 className="text-xl font-bold text-gray-900 mt-8 mb-8">{product.name}</h1>
                        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                            {/* Left side - Image Gallery */}
                            <div className="md:w-1/2">
                                <div className="relative aspect-square rounded-lg overflow-hidden">
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
                                                className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer w-20 h-20 ${index === activeImageIndex ? 'ring-2 ring-purple-500' : ''
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

                            {/* Right side - Product Details */}
                            <div className="md:w-1/2 space-y-6 md:space-y-8">
                                {/* Price */}
                                <div>
                                    <p className="text-2xl font-semibold text-purple-600">
                                        ${product.price.toFixed(2)}
                                    </p>
                                </div>

                                {/* Stock */}
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Stock</h2>
                                    <p className="mt-1 text-gray-600">{product.stock} units available</p>
                                </div>

                                {/* Category */}
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Category</h2>
                                    <p className="mt-1 text-gray-600">{product.category.name}</p>
                                </div>

                                {/* Add to Cart Button */}
                                <div className="w-[200px]">
                                <div className="pt-4 flex gap-4">
                                  <button
                                        onClick={handleBuyNow}
                                        className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed "
                                    >
                                        ყიდვა
                                    </button>
                                  </div>
                                <div className="pt-4 flex gap-4">
                                    <AddToCartButton product={product} />
                                  
                                </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom section - Description and Seller */}
                        <div className="mt-12 pt-8 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                                {/* Description */}
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Description</h2>
                                    <p className="mt-2 text-gray-600">{product.description}</p>
                                </div>

                                {/* Seller */}
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Seller</h2>
                                    <p className="mt-1 text-gray-600">{product.seller.name}</p>
                                </div>
                            </div>

                            {/* Product Features Section */}
                            {product.productFeatureValues && product.productFeatureValues.length > 0 && (
                                <div className="mt-8 pt-8 border-t border-gray-200">
                                    <div className="space-y-6">
                                        {product.productFeatureValues.map((group, groupIndex) => (
                                            <div key={groupIndex} className="bg-gray-50 rounded-lg">
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