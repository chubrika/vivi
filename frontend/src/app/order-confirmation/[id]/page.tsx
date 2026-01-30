'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { API_BASE_URL } from '../../../utils/api';
import Link from 'next/link';
import { ArrowLeftIcon, ListOrdered, ShoppingBag } from 'lucide-react';

interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

interface Order {
    _id: string;
    orderId: string;
    items: OrderItem[];
    totalAmount: number;
    shippingAddress: string;
    status: string;
    paymentMethod: string;
    paymentStatus: string;
    createdAt: string;
}

export default function OrderConfirmationPage() {
    const params = useParams();
    const orderId = params?.id as string;
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch order');
                }

                const data = await response.json();
                
                // Check if the order data is valid
                if (!data || !data._id) {
                    throw new Error('Invalid order data');
                }
                
                setOrder(data);
            } catch (error) {
                console.error('Error fetching order:', error);
                setError('Failed to load order details');
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    <p>{error || 'Order not found'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white md:p-8 p-4 rounded-xl shadow-lg">
                    <div className="text-center mb-4 md:mb-8">
                        <svg className="w-12 h-12 md:w-16 md:h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <h1 className="text-[16px] md:text-2xl font-semibold text-gray-800 mb-2">შეკვეთა წარმატებით შესრულდა</h1>
                        <p className="text-gray-600 text-[14px] md:text-base">შეკვეთის ნომერი: <span className="font-semibold">#{order.orderId}</span></p>
                    </div>

                    <div className="border-t border-b border-gray-200 md:py-6 py-4 md:mb-6 mb-4">
                        <h2 className="text-[16px] md:text-lg font-semibold text-gray-800 mb-4">შეკვეთის დეტალები</h2>
                        <div className="space-y-4">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        {item.image && (
                                            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg mr-4" />
                                        )}
                                        <div>
                                            <h3 className="text-gray-800 text-[14px] md:text-base font-medium">{item.name}</h3>
                                            <p className="text-gray-600 text-[14px] md:text-base">რაოდენობა: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-800 text-[14px] md:text-base font-medium">{(item.price * item.quantity).toFixed(2)} ₾</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between">
                            <span className="text-gray-600 text-[14px] md:text-base">მიტანის მისამართი</span>
                            <span className="text-gray-800 text-[14px] md:text-base">{order.shippingAddress}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 text-[14px] md:text-base">გადახდის მეთოდი</span>
                            <span className="text-gray-800 text-[14px] md:text-base">
                                {order.paymentMethod === 'card' ? 'ბარათით' : 
                                 order.paymentMethod === 'balance' ? 'ბალანსით' : 'კურიერთან'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 text-[14px] md:text-base">სულ თანხა</span>
                            <span className="text-gray-800 text-[14px] md:text-base font-semibold">{order.totalAmount.toFixed(2)} ₾</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center md:flex-row flex-col">
                        <Link href="/profile?section=orders"
                            className="flex items-center justify-center border border-sky-600 text-sky-600 py-3 px-6 rounded-lg hover:bg-sky-500 hover:text-white transition-colors duration-200 w-full md:w-[50%] mb-4 md:mb-0"
                            >
                            <ListOrdered className="w-4 h-4 mr-2" />
                            <span className="text-[14px] md:text-base">ჩემი შეკვეთები</span>
                        </Link>
                        <div className="w-[10px] md:block hidden"></div>
                        <Link 
                            href="/products"
                            className="flex items-center justify-center border border-sky-600 text-sky-600 py-3 px-6 rounded-lg hover:bg-sky-500 hover:text-white transition-colors duration-200 w-full md:w-[50%] mb-4 md:mb-0"
                        >
                            <ShoppingBag className="w-4 h-4 mr-2" />
                            <span className="text-[14px] md:text-base">ყიდვის გაგრძელება</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
} 