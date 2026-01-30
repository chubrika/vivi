'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../../utils/authContext';
import { API_BASE_URL } from '../../utils/api';
import { useCart } from '../../utils/cartContext';
import { useLoginSidebar } from '../../contexts/LoginSidebarContext';
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
    bankType: string;
}

export default function CheckoutPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const productId = searchParams?.get('productId');
    const quantityParam = searchParams?.get('quantity');
    const quantity = quantityParam ? parseInt(quantityParam) : 1;
    const { user, isAuthenticated } = useAuth();
    const { items: cartItems, totalPrice: cartTotalPrice, isLoading: cartLoading } = useCart();
    const { openLoginSidebar } = useLoginSidebar();
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
        paymentMethod: 'card',
        bankType: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [showAddressFormModal, setShowAddressFormModal] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [userBalance, setUserBalance] = useState<number>(0);
    const profileAddressesFetchedRef = useRef(false);
    const shippingPrice = 5;
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

    // Fetch profile + addresses once when authenticated (no duplicate profile/address calls)
    const fetchProfileAndAddresses = async () => {
        if (!isAuthenticated) return;
        try {
            setLoading(true);
            const userData = await userService.getCurrentUser();
            setUserBalance(userData.balance ?? 0);

            let firstName = userData.firstName ?? '';
            let lastName = userData.lastName ?? '';
            if (firstName.includes(' ') && !lastName) {
                const parts = firstName.split(' ');
                firstName = parts[0];
                lastName = parts.slice(1).join(' ');
            }

            const addressData = await addressService.getAddresses();
            const sortedAddresses = [...addressData].sort((a, b) => {
                if (a.isDefault) return -1;
                if (b.isDefault) return 1;
                return 0;
            });
            setAddresses(sortedAddresses);

            const defaultAddress = sortedAddresses.find((addr) => addr.isDefault) ?? sortedAddresses[0];
            const address = defaultAddress?.address ?? '';
            if (defaultAddress) {
                setSelectedAddressId(defaultAddress._id ?? null);
            }

            setFormData(prev => ({
                ...prev,
                firstName,
                lastName,
                phoneNumber: userData.phoneNumber ?? '',
                personalNumber: userData.personalNumber ?? '',
                address,
            }));
        } catch (err) {
            console.error('Error fetching user data:', err);
            setError('Failed to load user information');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) {
            setUserBalance(0);
            profileAddressesFetchedRef.current = false;
            return;
        }
        if (profileAddressesFetchedRef.current) return;
        profileAddressesFetchedRef.current = true;
        fetchProfileAndAddresses();
    }, [isAuthenticated]);

    const fetchAddresses = async () => {
        if (!isAuthenticated) return;
        try {
            const addressData = await addressService.getAddresses();
            const sorted = [...addressData].sort((a, b) => {
                if (a.isDefault) return -1;
                if (b.isDefault) return 1;
                return 0;
            });
            setAddresses(sorted);
            const defaultAddr = sorted.find((addr) => addr.isDefault) ?? sorted[0];
            if (defaultAddr) {
                setSelectedAddressId(defaultAddr._id ?? null);
                setFormData(prev => ({ ...prev, address: defaultAddr.address }));
            } else if (sorted.length > 0) {
                setSelectedAddressId(sorted[0]._id ?? null);
                setFormData(prev => ({ ...prev, address: sorted[0].address }));
            }
        } catch (err) {
            console.error('Error fetching addresses:', err);
        }
    };

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
        // Check if user is authenticated
        if (!isAuthenticated) {
            openLoginSidebar();
            return;
        }

        // Validate form data
        const errors: Record<string, string> = {};
        if (!formData.firstName) errors.firstName = 'სახელი სავალდებულოა';
        if (!formData.lastName) errors.lastName = 'გვარი სავალდებულოა';
        if (!formData.phoneNumber) errors.phoneNumber = 'მობილური ნომერი სავალდებულოა';
        if (!formData.personalNumber) errors.personalNumber = 'პირადი ნომერი სავალდებულოა';
        if (!formData.address) errors.address = 'მისამართი სავალდებულოა';
        if (formData.paymentMethod === 'card' && !['tbc', 'bog'].includes(formData.bankType)) {
            errors.bankType = 'გთხოვთ აირჩიოთ ბანკი';
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        // Calculate total amount
        const totalAmount = isCartCheckout 
            ? cartTotalPrice 
            : (product?.price ? product.price * quantity : 0);

        // Check balance if payment method is balance
        if (formData.paymentMethod === 'balance') {
            if (userBalance < totalAmount) {
                setError('ბალანსზე გაქვთ არასაკმარისი თანხა!');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
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

    const handleFillUserInfo = async () => {
        if (!isAuthenticated) {
            alert('Please log in to use this feature');
            return;
        }
        setError('');
        await fetchProfileAndAddresses();
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
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
                </div>
            </div>
        );
    }

    if (!isCartCheckout && !product) return <div>Product not found</div>;
    if (isCartCheckout && cartItemsToCheckout.length === 0) return <div>Cart is empty</div>;

    const isFormValid = Boolean(
        formData.firstName?.trim() &&
        formData.lastName?.trim() &&
        formData.phoneNumber?.trim() &&
        formData.personalNumber?.trim() &&
        formData.address?.trim()
    );
    const isBankSelected = formData.bankType === 'tbc' || formData.bankType === 'bog';
    const isCardPaymentValid = formData.paymentMethod !== 'card' || isBankSelected;
    const buttonDisabled = !isFormValid || !isCardPaymentValid;

    return (
        <div className="container mx-auto px-4 py-3">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left side - Recipient Information */}
                <div className="lg:col-span-2 space-y-8">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="font-medium">{error}</p>
                            </div>
                        </div>
                    )}
                    {!isAuthenticated && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <p className="text-yellow-800 font-medium">ყიდვის დასასრულებლად გაიარეთ რეგისტრაცია</p>
                            </div>
                        </div>
                    )}
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
                                        disabled={!isAuthenticated}
                                        className={`w-full px-4 py-3 rounded-lg border ${formErrors.firstName ? 'border-red-500' : 'border-gray-200'} focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all duration-200 outline-none peer text-gray-800 ${!isAuthenticated ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
                                        placeholder=" "
                                    />
                                    <label className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${
                                        formData.firstName ? '-top-2 text-xs text-sky-500' : 'top-3 text-base text-gray-500'
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
                                        disabled={!isAuthenticated}
                                        className={`w-full px-4 py-3 rounded-lg border ${formErrors.lastName ? 'border-red-500' : 'border-gray-200'} focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all duration-200 outline-none peer text-gray-800 ${!isAuthenticated ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
                                        placeholder=" "
                                    />
                                    <label className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${
                                        formData.lastName ? '-top-2 text-xs text-sky-500' : 'top-3 text-base text-gray-500'
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
                                        disabled={!isAuthenticated}
                                        className={`w-full px-4 py-3 rounded-lg border ${formErrors.phoneNumber ? 'border-red-500' : 'border-gray-200'} focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all duration-200 outline-none peer text-gray-800 ${!isAuthenticated ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
                                        placeholder=" "
                                    />
                                    <label className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${
                                        formData.phoneNumber ? '-top-2 text-xs text-sky-500' : 'top-3 text-base text-gray-500'
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
                                        disabled={!isAuthenticated}
                                        className={`w-full px-4 py-3 rounded-lg border ${formErrors.personalNumber ? 'border-red-500' : 'border-gray-200'} focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all duration-200 outline-none peer text-gray-800 ${!isAuthenticated ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
                                        placeholder=" "
                                    />
                                    <label className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${
                                        formData.personalNumber ? '-top-2 text-xs text-sky-500' : 'top-3 text-base text-gray-500'
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
                                    disabled={!isAuthenticated}
                                    className={`w-full px-4 py-3 rounded-lg border ${formErrors.address ? 'border-red-500' : 'border-gray-200'} focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all duration-200 outline-none peer text-gray-800 ${!isAuthenticated ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
                                    placeholder=" "
                                />
                                <label className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${
                                    formData.address ? '-top-2 text-xs text-sky-500' : 'top-3 text-base text-gray-500'
                                }`}>
                                    მისამართი
                                </label>
                                <label 
                                    onClick={() => isAuthenticated && setShowAddressModal(true)}
                                    className={`absolute right-4 top-3 text-sm ${isAuthenticated ? 'text-sky-600 cursor-pointer hover:text-sky-800' : 'text-gray-400 cursor-not-allowed'} transition-colors duration-200`}
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
                                    disabled={!isAuthenticated}
                                    className={`w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all duration-200 outline-none resize-none peer text-gray-800 ${!isAuthenticated ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
                                    placeholder=" "
                                />
                                <label className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${
                                    formData.comment ? '-top-2 text-xs text-sky-500' : 'top-3 text-base text-gray-500'
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
                                            onClick={() => isAuthenticated && setFormData(prev => ({ ...prev, paymentMethod: 'card' }))}
                                            disabled={!isAuthenticated}
                                            className={`w-full flex items-center justify-between p-4 ${
                                                formData.paymentMethod === 'card' ? 'bg-sky-50' : 'bg-white'
                                            } ${isAuthenticated ? 'hover:bg-sky-50' : 'cursor-not-allowed opacity-60'} transition-all duration-200`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                </svg>
                                                <span className="text-gray-800">ბარათით გადახდა</span>
                                            </div>
                                            {formData.paymentMethod === 'card' && (
                                                <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                                                checked={formData.bankType === 'tbc'}
                                                                onChange={handleInputChange}
                                                                className="h-4 w-4 text-sky-600 focus:ring-sky-500"
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
                                                                checked={formData.bankType === 'bog'}
                                                                onChange={handleInputChange}
                                                                className="h-4 w-4 text-sky-600 focus:ring-sky-500"
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
                                                            className="h-4 w-4 text-sky-600 focus:ring-sky-500 rounded"
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
                                            onClick={() => isAuthenticated && setFormData(prev => ({ ...prev, paymentMethod: 'balance' }))}
                                            disabled={true}
                                            className={`w-full flex items-center justify-between p-4 ${
                                                formData.paymentMethod === 'balance' ? 'bg-sky-50' : 'bg-white'
                                            } cursor-not-allowed opacity-60 transition-all duration-200`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <div className="flex items-center">
                                                    <span className="text-gray-800">ბალანსით გადახდა</span>
                                                    <span className="text-sm ml-2 font-bold text-red-500">მალე</span>
                                                    {/* {isAuthenticated && (
                                                        <span className="text-sm ml-2 font-bold text-gray-900 bg-sky-200 rounded-full px-2 py-1">
                                                            {userBalance.toFixed(2)} ₾
                                                        </span>
                                                    )} */}
                                                </div>
                                            </div>
                                            {formData.paymentMethod === 'balance' && (
                                                <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>

                                    {/* Cash on Delivery */}
                                    <div className="border border-gray-200 rounded-lg">
                                        <button
                                            type="button"
                                            onClick={() => isAuthenticated && setFormData(prev => ({ ...prev, paymentMethod: 'cash' }))}
                                            disabled={true}
                                            className={`w-full flex items-center justify-between p-4 ${
                                                formData.paymentMethod === 'cash' ? 'bg-sky-50' : 'bg-white'
                                            } cursor-not-allowed opacity-60 transition-all duration-200`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                <span className="text-gray-800">კურიერთან გადახდა</span>
                                                <span className="text-sm ml-2 font-bold text-red-500">მალე</span>
                                            </div>
                                            {formData.paymentMethod === 'cash' && (
                                                <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        <h2 className="text-md font-bold mb-2 text-gray-600">შეკვეთის დეტალები</h2>
                        <div className="space-y-3">
                            <div className="space-y-2 border-t pt-2">
                                <div className="flex justify-between text-gray-600">
                                    <span className="text-[14px] font-semibold">პროდუქტი</span>
                                    <span className="text-black font-bold">{isCartCheckout ? cartItemsToCheckout.reduce((sum, item) => sum + item.quantity, 0) : quantity}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span className="text-[14px] font-semibold">ფასი</span>
                                    <span className="text-black font-bold">{isCartCheckout ? cartTotalPrice.toFixed(2) : (product?.price ? product.price * quantity : 0).toFixed(2)} ₾</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span className="text-[14px] font-semibold">მიტანა</span>
                                    <span className="text-black font-bold">5 ₾</span>
                                </div>
                                <div className="flex justify-between border-t text-gray-600 pt-2">
                                    <span className="text-[14px] font-semibold">სულ თანხა</span>
                                    <span className="text-black font-bold">{((isCartCheckout ? cartTotalPrice : (product?.price ? product.price * quantity : 0)) + shippingPrice).toFixed(2)} ₾</span>
                                </div>
                            </div>

                            {isAuthenticated ? (
                                <button
                                    onClick={handleSubmit}
                                    className={`w-full py-4 px-6 rounded-lg transition-colors duration-200 font-medium text-sm shadow-md hover:shadow-lg ${
                                        buttonDisabled
                                            ? 'bg-white text-gray-400 cursor-not-allowed'
                                            : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                                    disabled={buttonDisabled}
                                >
                                    შეკვეთის დასრულება
                                </button>
                            ) : (
                                <button
                                    onClick={openLoginSidebar}
                                    className="w-full bg-sky-600 text-white py-4 px-6 rounded-lg hover:bg-sky-700 transition-colors duration-200 font-medium text-sm shadow-md hover:shadow-lg"
                                >
                                    ყიდვის დასასრულებლად გაიარეთ რეგისტრაცია
                                </button>
                            )}
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
                            className="flex items-center text-sky-600 hover:text-sky-800 transition-colors duration-200"
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
                                            ? 'border-sky-500 bg-sky-50' 
                                            : 'border-gray-200 hover:border-sky-300'
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
                                                className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300"
                                            />
                                        </div>
                                        <div className="ml-3">
                                            <label htmlFor={`address-${address._id}`} className="font-medium text-gray-900">
                                                {address.title}
                                            </label>
                                            {address.isDefault && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800 mt-1 ml-2">
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
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
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