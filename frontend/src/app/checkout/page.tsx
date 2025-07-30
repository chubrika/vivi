'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../../utils/authContext';
import { API_BASE_URL } from '../../utils/api';
import { useCart } from '../../utils/cartContext';
import Modal from '../../components/Modal';
import { addressService, Address } from '../../services/addressService';
import AddressForm from '../../components/AddressForm';
import { userService } from '../../services/userService';

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
    firstName: string;
    lastName: string;
    phoneNumber: string;
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
        firstName: '',
        lastName: '',
        phoneNumber: '',
        personalNumber: '',
        address: '',
        comment: '',
        paymentMethod: 'card'
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [showAddressFormModal, setShowAddressFormModal] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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
                let firstName = userData.firstName || '';
                let lastName = userData.lastName || '';
                
                if (firstName.includes(' ')) {
                    const nameParts = firstName.split(' ');
                    firstName = nameParts[0];
                    lastName = nameParts.slice(1).join(' ');
                }

                // Fetch user's default address
                const addressResponse = await fetch(`${API_BASE_URL}/api/addresses`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                let address = '';
                let defaultAddressId = null;
                
                if (addressResponse.ok) {
                    const addresses = await addressResponse.json();
                    const defaultAddress = addresses.find((addr: any) => addr.isDefault);
                    if (defaultAddress) {
                        address = defaultAddress.address;
                        defaultAddressId = defaultAddress._id;
                        setSelectedAddressId(defaultAddressId);
                    }
                }

                // Update form with user data
                setFormData(prev => ({
                    ...prev,
                    firstName: firstName,
                    lastName: lastName,
                    phoneNumber: userData.phoneNumber || '',
                    personalNumber: userData.personalNumber || '',
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

    // Function to fetch addresses
    const fetchAddresses = async () => {
        if (!isAuthenticated) {
            return;
        }

        try {
            const addressData = await addressService.getAddresses();
            
            // Sort addresses to put default address first
            const sortedAddresses = [...addressData].sort((a, b) => {
                if (a.isDefault) return -1;
                if (b.isDefault) return 1;
                return 0;
            });
            
            setAddresses(sortedAddresses);
            
            // Find the default address
            const defaultAddress = sortedAddresses.find(addr => addr.isDefault);
            if (defaultAddress) {
                // Use _id for MongoDB documents
                setSelectedAddressId(defaultAddress._id || null);
                setFormData(prev => ({
                    ...prev,
                    address: defaultAddress.address
                }));
            } else if (sortedAddresses.length > 0) {
                // If no default address but addresses exist, select the first one
                setSelectedAddressId(sortedAddresses[0]._id || null);
                setFormData(prev => ({
                    ...prev,
                    address: sortedAddresses[0].address
                }));
            }
        } catch (err) {
            console.error('Error fetching addresses:', err);
        }
    };

    // Fetch addresses when the address modal is opened
    useEffect(() => {
        if (showAddressModal) {
            fetchAddresses();
        }
    }, [showAddressModal]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate form data
        const errors: Record<string, string> = {};
        if (!formData.firstName) errors.firstName = 'სახელი სავალდებულოა';
        if (!formData.lastName) errors.lastName = 'გვარი სავალდებულოა';
        if (!formData.phoneNumber) errors.phoneNumber = 'მობილური ნომერი სავალდებულოა';
        if (!formData.personalNumber) errors.personalNumber = 'პირადი ნომერი სავალდებულოა';
        if (!formData.address) errors.address = 'მისამართი სავალდებულოა';

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            // Update user profile with the new information
            await userService.updateProfile({
                firstName: formData.firstName,
                lastName: formData.lastName,
                phoneNumber: formData.phoneNumber,
                personalNumber: formData.personalNumber
            });

            // Create order
            const response = await fetch(`${API_BASE_URL}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    shippingAddress: formData.address,
                    paymentMethod: formData.paymentMethod
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create order');
            }

            // Check if the order was created successfully
            if (data.order && data.order._id) {
                // If payment method is balance and payment is completed, show success message
                if (formData.paymentMethod === 'balance' && data.order.paymentStatus === 'completed') {
                    // Redirect to order confirmation page
                    router.push(`/order-confirmation/${data.order._id}`);
                } else {
                    // For other payment methods, handle accordingly
                    router.push(`/order-confirmation/${data.order._id}`);
                }
            } else {
                throw new Error('Invalid order response');
            }
        } catch (error) {
            console.error('Error creating order:', error);
            // Display more detailed error message if available
            const errorMessage = error instanceof Error ? error.message : 'Failed to create order. Please try again.';
            setError(errorMessage);
        }
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
            let firstName = userData.firstName || '';
            let lastName = '';
            
            if (firstName.includes(' ')) {
                const nameParts = firstName.split(' ');
                firstName = nameParts[0];
                lastName = nameParts.slice(1).join(' ');
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
                firstName: firstName,
                lastName: lastName,
                phoneNumber: userData.phoneNumber || '',
                personalNumber: userData.personalNumber || '',
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

    const handleAddressSelect = (address: Address) => {
        // Use _id for MongoDB documents
        setSelectedAddressId(address._id || null);
        setFormData(prev => ({
            ...prev,
            address: address.address
        }));
    };

    const handleAddressModalClose = () => {
        setShowAddressModal(false);
    };

    const handleAddAddress = () => {
        setShowAddressFormModal(true);
    };

    const handleAddressFormClose = () => {
        setShowAddressFormModal(false);
    };

    const handleAddressSave = async (address: Address) => {
        try {
            await addressService.addAddress(address);
            setShowAddressFormModal(false);
            fetchAddresses(); // Refresh the address list
        } catch (err) {
            console.error('Error saving address:', err);
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
        <div className="container mx-auto px-4 py-3">
            
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
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        required
                                        className={`w-full px-4 py-3 rounded-lg border ${formErrors.firstName ? 'border-red-500' : 'border-gray-200'} focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none peer text-gray-800`}
                                        placeholder=" "
                                    />
                                    <label className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${
                                        formData.firstName ? '-top-2 text-xs text-purple-500' : 'top-3 text-base text-gray-500'
                                    }`}>
                                        სახელი
                                    </label>
                                    {formErrors.firstName && (
                                        <p className="mt-1 text-sm text-red-500">{formErrors.firstName}</p>
                                    )}
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        required
                                        className={`w-full px-4 py-3 rounded-lg border ${formErrors.lastName ? 'border-red-500' : 'border-gray-200'} focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none peer text-gray-800`}
                                        placeholder=" "
                                    />
                                    <label className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${
                                        formData.lastName ? '-top-2 text-xs text-purple-500' : 'top-3 text-base text-gray-500'
                                    }`}>
                                        გვარი
                                    </label>
                                    {formErrors.lastName && (
                                        <p className="mt-1 text-sm text-red-500">{formErrors.lastName}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="relative">
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        required
                                        className={`w-full px-4 py-3 rounded-lg border ${formErrors.phoneNumber ? 'border-red-500' : 'border-gray-200'} focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none peer text-gray-800`}
                                        placeholder=" "
                                    />
                                    <label className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${
                                        formData.phoneNumber ? '-top-2 text-xs text-purple-500' : 'top-3 text-base text-gray-500'
                                    }`}>
                                       ტელეფონის ნომერი
                                    </label>
                                    {formErrors.phoneNumber && (
                                        <p className="mt-1 text-sm text-red-500">{formErrors.phoneNumber}</p>
                                    )}
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="personalNumber"
                                        value={formData.personalNumber}
                                        onChange={handleInputChange}
                                        required
                                        className={`w-full px-4 py-3 rounded-lg border ${formErrors.personalNumber ? 'border-red-500' : 'border-gray-200'} focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none peer text-gray-800`}
                                        placeholder=" "
                                    />
                                    <label className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${
                                        formData.personalNumber ? '-top-2 text-xs text-purple-500' : 'top-3 text-base text-gray-500'
                                    }`}>
                                        პირადი ნომერი
                                    </label>
                                    {formErrors.personalNumber && (
                                        <p className="mt-1 text-sm text-red-500">{formErrors.personalNumber}</p>
                                    )}
                                </div>
                            </div>

                            <div className="relative">
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    required
                                    className={`w-full px-4 py-3 rounded-lg border ${formErrors.address ? 'border-red-500' : 'border-gray-200'} focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none peer text-gray-800`}
                                    placeholder=" "
                                />
                                <label className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${
                                    formData.address ? '-top-2 text-xs text-purple-500' : 'top-3 text-base text-gray-500'
                                }`}>
                                    მისამართი
                                </label>
                                <label 
                                    onClick={() => setShowAddressModal(true)}
                                    className="absolute right-4 top-3 text-sm text-purple-600 cursor-pointer hover:text-purple-800 transition-colors duration-200"
                                >
                                    მისამართის შეცვლა
                                </label>
                                {formErrors.address && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.address}</p>
                                )}
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
                                <div className="space-y-2">
                                    {/* Card Payment Accordion */}
                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'card' }))}
                                            className={`w-full flex items-center justify-between p-4 ${
                                                formData.paymentMethod === 'card' ? 'bg-purple-50' : 'bg-white'
                                            } hover:bg-purple-50 transition-all duration-200`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                </svg>
                                                <span className="text-gray-800">ბარათით გადახდა</span>
                                            </div>
                                            {formData.paymentMethod === 'card' && (
                                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </button>
                                        {formData.paymentMethod === 'card' && (
                                            <div className="p-4 bg-white border-t border-gray-200">
                                                <div className="space-y-4">
                                                    <div className="flex items-center">
                                                        <div className="flex items-center space-x-3 mr-5">
                                                            <input
                                                                type="radio"
                                                                id="tbc"
                                                                name="bankType"
                                                                value="tbc"
                                                                className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                                                            />
                                                            <label htmlFor="tbc" className="text-gray-800">თიბისი ბანკი</label>
                                                        </div>
                                                        <Image src="/img/tbc.svg" alt="TBC Bank" width={24} height={24} />
                                                    </div>
                                                    <div className="flex items-center">
                                                        <div className="flex items-center space-x-3 mr-5">
                                                            <input
                                                                type="radio"
                                                                id="bog"
                                                                name="bankType"
                                                                value="bog"
                                                                className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                                                            />
                                                            <label htmlFor="bog" className="text-gray-800">საქართველოს ბანკი</label>
                                                        </div>
                                                        <Image src="/img/bog.svg" alt="BOG Bank" width={24} height={24} />
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <input
                                                            type="checkbox"
                                                            id="saveCard"
                                                            name="saveCard"
                                                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 rounded"
                                                        />
                                                        <label htmlFor="saveCard" className="text-gray-800">ბარათის დამახსოვრება</label>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Balance Payment */}
                                    <div className="border border-gray-200 rounded-lg">
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'balance' }))}
                                            className={`w-full flex items-center justify-between p-4 ${
                                                formData.paymentMethod === 'balance' ? 'bg-purple-50' : 'bg-white'
                                            } hover:bg-purple-50 transition-all duration-200`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-gray-800">ბალანსით გადახდა</span>
                                            </div>
                                            {formData.paymentMethod === 'balance' && (
                                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>

                                    {/* Cash on Delivery */}
                                    <div className="border border-gray-200 rounded-lg">
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'cash' }))}
                                            className={`w-full flex items-center justify-between p-4 ${
                                                formData.paymentMethod === 'cash' ? 'bg-purple-50' : 'bg-white'
                                            } hover:bg-purple-50 transition-all duration-200`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                <span className="text-gray-800">კურიერთან გადახდა</span>
                                            </div>
                                            {formData.paymentMethod === 'cash' && (
                                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
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
                                className="w-full bg-purple-600 text-white py-4 px-6 rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium text-sm shadow-md hover:shadow-lg"
                            >
                                შეკვეთის დასრულება
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Address Selection Modal */}
            <Modal 
                isOpen={showAddressModal} 
                onClose={handleAddressModalClose} 
                title="აირჩიეთ მისამართი"
                size="md"
            >
                <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-t pt-2 border-gray-200">
                        <button
                            onClick={handleAddAddress}
                            className="flex items-center text-purple-600 hover:text-purple-800 transition-colors duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            <span>მისამართის დამატება</span>
                        </button>
                    </div>

                    {addresses.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">მისამართები არ არის დამატებული.</p>
                    ) : (
                        <div className="space-y-3">
                            {addresses.map((address) => (
                                <div 
                                    key={address._id} 
                                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                                        selectedAddressId === address._id 
                                            ? 'border-purple-500 bg-purple-50' 
                                            : 'border-gray-200 hover:border-purple-300'
                                    }`}
                                    onClick={() => handleAddressSelect(address)}
                                >
                                    <div className="flex items-start">
                                        <div className="flex items-center h-5">
                                            <input
                                                type="radio"
                                                id={`address-${address._id}`}
                                                name="address"
                                                checked={selectedAddressId === address._id}
                                                onChange={() => handleAddressSelect(address)}
                                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                                            />
                                        </div>
                                        <div className="ml-3">
                                            <label htmlFor={`address-${address._id}`} className="font-medium text-gray-900">
                                                {address.title}
                                            </label>
                                            {address.isDefault && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-1 ml-2">
                                                    ძირითადი მისამართი
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <div className="flex justify-end mt-6">
                        <button
                            type="button"
                            onClick={handleAddressModalClose}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        >
                            დახურვა
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Address Form Modal */}
            <Modal
                isOpen={showAddressFormModal}
                onClose={handleAddressFormClose}
                title="მისამართის დამატება"
                size="lg"
            >
                <AddressForm
                    onSave={handleAddressSave}
                    onCancel={handleAddressFormClose}
                />
            </Modal>
        </div>
    );
} 