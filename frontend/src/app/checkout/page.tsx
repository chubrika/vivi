'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../../utils/authContext';
import { API_BASE_URL } from '../../utils/api';
import { useCart } from '../../utils/cartContext';

interface Product {
    _id: string;
    name: string;
    price: number;
    images: string[];
}

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
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
    const router = useRouter();
    const productId = searchParams?.get('productId');
    const quantityParam = searchParams?.get('quantity');
    const quantity = quantityParam ? parseInt(quantityParam) : 1;
    const { user, isAuthenticated } = useAuth();
    const { items: cartItems, totalPrice: cartTotalPrice, isLoading: cartLoading } = useCart();
    
    const [product, setProduct] = useState<Product | null>(null);
    const [cartItemsToCheckout, setCartItemsToCheckout] = useState<CartItem[]>([]);
    const [isCartCheckout, setIsCartCheckout] = useState(false);
    const [formData, setFormData] = useState<CheckoutForm>({
        name: '',
        surname: '',
        mobile: '',
        personalNumber: '',
        address: '',
        comment: '',
        paymentMethod: 'card'
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Determine if we're doing a cart checkout or direct product checkout
    useEffect(() => {
        if (productId) {
            // Direct product checkout
            setIsCartCheckout(false);
            fetch(`/api/products/${productId}`)
                .then(res => res.json())
                .then(data => {
                    setProduct(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Error fetching product:', err);
                    setError('Failed to load product');
                    setLoading(false);
                });
        } else if (cartItems.length > 0) {
            // Cart checkout
            setIsCartCheckout(true);
            setCartItemsToCheckout(cartItems);
            setLoading(false);
        } else {
            // No product ID and empty cart, redirect to products page
            router.push('/products');
        }
    }, [productId, cartItems, router]);

    // Automatically fill user profile data when component mounts
    useEffect(() => {
        const fillUserInfo = async () => {
            if (!isAuthenticated) {
                return;
            }

            try {
                setLoading(true);
                const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user profile');
                }

                const userData = await response.json();
                
                // Split the name into first and last name if it exists
                let name = userData.name || '';
                let surname = '';
                
                if (name.includes(' ')) {
                    const nameParts = name.split(' ');
                    name = nameParts[0];
                    surname = nameParts.slice(1).join(' ');
                }

                // Fetch user's default address
                const addressResponse = await fetch(`${API_BASE_URL}/api/addresses`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                let address = '';
                if (addressResponse.ok) {
                    const addresses = await addressResponse.json();
                    const defaultAddress = addresses.find((addr: any) => addr.isDefault);
                    if (defaultAddress) {
                        address = defaultAddress.address;
                    }
                }

                // Update form with user data
                setFormData(prev => ({
                    ...prev,
                    name: name,
                    surname: surname,
                    mobile: userData.phone || '',
                    address: address,
                    // Keep other fields as they are
                }));
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError('Failed to load user information');
            } finally {
                setLoading(false);
            }
        };

        fillUserInfo();
    }, [isAuthenticated]);

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
        if (isCartCheckout) {
            console.log('Order submitted from cart:', { cartItems: cartItemsToCheckout, formData });
        } else {
            console.log('Order submitted for single product:', { product, quantity, formData });
        }
        // TODO: Implement order submission logic
    };

    // Manual fill function for the button (as a fallback)
    const handleFillUserInfo = async () => {
        if (!isAuthenticated) {
            alert('Please log in to use this feature');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user profile');
            }

            const userData = await response.json();
            
            // Split the name into first and last name if it exists
            let name = userData.name || '';
            let surname = '';
            
            if (name.includes(' ')) {
                const nameParts = name.split(' ');
                name = nameParts[0];
                surname = nameParts.slice(1).join(' ');
            }

            // Fetch user's default address
            const addressResponse = await fetch(`${API_BASE_URL}/api/addresses`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            let address = '';
            if (addressResponse.ok) {
                const addresses = await addressResponse.json();
                const defaultAddress = addresses.find((addr: any) => addr.isDefault);
                if (defaultAddress) {
                    address = defaultAddress.address;
                }
            }

            // Update form with user data
            setFormData(prev => ({
                ...prev,
                name: name,
                surname: surname,
                mobile: userData.phone || '',
                address: address,
                // Keep other fields as they are
            }));
        } catch (err) {
            console.error('Error fetching user data:', err);
            setError('Failed to load user information');
        } finally {
            setLoading(false);
        }
    };

    if (loading || cartLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!isCartCheckout && !product) return <div>Product not found</div>;
    if (isCartCheckout && cartItemsToCheckout.length === 0) return <div>Cart is empty</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left side - Recipient Information */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-xl shadow-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-600">მიმღები</h2>
                        </div>
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
                                        სახელი
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
                                        გვარი
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
                                       ტელეფონის ნომერი
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
                                        პირადი ნომერი
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
                                    მისამართი
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
                                    კომენტარი
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
                                    გადახდის მეთოდი
                                </label>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right side - Order Details */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-8 rounded-xl shadow-lg">
                        <h2 className="text-xl font-semibold mb-6 text-gray-600">შეკვეთის დეტალები</h2>
                        <div className="space-y-6">
                            <div className="space-y-3 border-t pt-4">
                                <div className="flex justify-between text-gray-600">
                                    <span>პროდუქტი</span>
                                    <span>{isCartCheckout ? cartItemsToCheckout.reduce((sum, item) => sum + item.quantity, 0) : quantity}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>ფასი</span>
                                    <span>${isCartCheckout ? cartTotalPrice.toFixed(2) : (product?.price ? product.price * quantity : 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>მიტანა</span>
                                    <span className="text-green-600">Free</span>
                                </div>
                                <div className="flex justify-between font-semibold text-lg border-t text-gray-600 pt-4">
                                    <span>სულ თანხა</span>
                                    <span className="text-purple-600">${isCartCheckout ? cartTotalPrice.toFixed(2) : (product?.price ? product.price * quantity : 0).toFixed(2)}</span>
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