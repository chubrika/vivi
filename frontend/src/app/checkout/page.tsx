'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

interface Product {
    _id: string;
    name: string;
    price: number;
    images: string[];
}

interface CheckoutForm {
    name: string;
    surname: string;
    mobile: string;
    personalNumber: string;
    address: string;
    comment: string;
    paymentMethod: string;
}

export default function CheckoutPage() {
    const searchParams = useSearchParams();
    const productId = searchParams?.get('productId');
    
    const [product, setProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<CheckoutForm>({
        name: '',
        surname: '',
        mobile: '',
        personalNumber: '',
        address: '',
        comment: '',
        paymentMethod: 'card'
    });

    useEffect(() => {
        // Fetch product details
        if (productId) {
            fetch(`/api/products/${productId}`)
                .then(res => res.json())
                .then(data => setProduct(data))
                .catch(err => console.error('Error fetching product:', err));
        }
    }, [productId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle order submission
        console.log('Order submitted:', { product, formData });
        // TODO: Implement order submission logic
    };

    if (!product) return <div>Loading...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left side - Recipient Information */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-xl shadow-lg">
                        <h2 className="text-xl font-semibold mb-6 text-gray-600">მიმღები</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none peer text-gray-800"
                                        placeholder=" "
                                    />
                                    <label className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${
                                        formData.name ? '-top-2 text-xs text-purple-500' : 'top-3 text-base text-gray-500'
                                    }`}>
                                        Name
                                    </label>
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="surname"
                                        value={formData.surname}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none peer text-gray-800"
                                        placeholder=" "
                                    />
                                    <label className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${
                                        formData.surname ? '-top-2 text-xs text-purple-500' : 'top-3 text-base text-gray-500'
                                    }`}>
                                        Surname
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="relative">
                                    <input
                                        type="tel"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none peer text-gray-800"
                                        placeholder=" "
                                    />
                                    <label className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${
                                        formData.mobile ? '-top-2 text-xs text-purple-500' : 'top-3 text-base text-gray-500'
                                    }`}>
                                        Mobile
                                    </label>
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="personalNumber"
                                        value={formData.personalNumber}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none peer text-gray-800"
                                        placeholder=" "
                                    />
                                    <label className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${
                                        formData.personalNumber ? '-top-2 text-xs text-purple-500' : 'top-3 text-base text-gray-500'
                                    }`}>
                                        Personal Number
                                    </label>
                                </div>
                            </div>

                            <div className="relative">
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none peer text-gray-800"
                                    placeholder=" "
                                />
                                <label className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${
                                    formData.address ? '-top-2 text-xs text-purple-500' : 'top-3 text-base text-gray-500'
                                }`}>
                                    Address
                                </label>
                            </div>

                            <div className="relative">
                                <textarea
                                    name="comment"
                                    value={formData.comment}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none resize-none peer text-gray-800"
                                    placeholder=" "
                                />
                                <label className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${
                                    formData.comment ? '-top-2 text-xs text-purple-500' : 'top-3 text-base text-gray-500'
                                }`}>
                                    Comment
                                </label>
                            </div>

                            <div className="relative">
                                <select
                                    name="paymentMethod"
                                    value={formData.paymentMethod}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none appearance-none bg-white peer text-gray-800"
                                >
                                    <option value="card">Credit Card</option>
                                    <option value="bank">Bank Transfer</option>
                                    <option value="cash">Cash on Delivery</option>
                                </select>
                                <label className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${
                                    formData.paymentMethod ? '-top-2 text-xs text-purple-500' : 'top-3 text-base text-gray-500'
                                }`}>
                                    Payment Method
                                </label>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right side - Order Details */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-8 rounded-xl shadow-lg">
                        <h2 className="text-xl font-semibold mb-6">Order Details</h2>
                        <div className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <div className="relative w-24 h-24">
                                    <Image
                                        src={product.images[0]}
                                        alt={product.name}
                                        fill
                                        className="object-cover rounded-lg"
                                    />
                                </div>
                                <div>
                                    <p className="text-gray-900 text-md">{product.price.toFixed(2)} ₾</p>
                                    <h3 className="font-medium text-gray-900 text-lg">{product.name}</h3>
                                </div>
                            </div>

                            <div className="border-t pt-6 space-y-4">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>${product.price.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="text-green-600">Free</span>
                                </div>
                                <div className="flex justify-between font-semibold text-lg border-t pt-4">
                                    <span>Total</span>
                                    <span className="text-purple-600">${product.price.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                className="w-full bg-purple-600 text-white py-4 px-6 rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium text-lg shadow-md hover:shadow-lg"
                            >
                                Finish Order
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 