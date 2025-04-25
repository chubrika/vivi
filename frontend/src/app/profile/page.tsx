'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getToken } from '../../utils/authContext';
import { API_BASE_URL } from '../../utils/api';
import { userService } from '../../services/userService';
import { addressService, Address } from '../../services/addressService';
import { orderService, Order } from '../../services/orderService';
import Link from 'next/link';
import GoogleMap from '../../components/GoogleMap';
import Modal from '../../components/Modal';
import AddressForm from '../../components/AddressForm';
import PasswordChangeModal from '../../components/PasswordChangeModal';

interface UserProfile {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  bio?: string;
  balance: number;
  createdAt?: string;
  updatedAt?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('personal');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    title: '',
    address: '',
    latitude: 0,
    longitude: 0,
    isDefault: false
  });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: ''
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceError, setBalanceError] = useState('');
  const [balanceSuccess, setBalanceSuccess] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  // Function to fetch addresses
  const fetchAddresses = async () => {
    try {
      // Use the addressService to fetch addresses
      const addressData = await addressService.getAddresses();
      setAddresses(addressData);
      setAddressError('');
    } catch (err) {
      console.error('Error fetching addresses:', err);
      setAddressError('Failed to load addresses');
    }
  };

  // Function to fetch orders
  const fetchOrders = async () => {
    setOrdersLoading(true);
    setOrdersError('');
    try {
      const orderData = await orderService.getUserOrders();
      setOrders(orderData);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setOrdersError('Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch addresses when the addresses section is selected
  useEffect(() => {
    if (activeSection === 'addresses') {
      fetchAddresses();
    }
  }, [activeSection]);

  // Fetch orders when the orders section is selected
  useEffect(() => {
    if (activeSection === 'orders') {
      fetchOrders();
    }
  }, [activeSection]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated()) {
        router.push('/login');
        return;
      }

      try {
        // Use the userService to fetch the profile
        const userData = await userService.getCurrentUser();
        setProfile({
          ...userData,
          balance: userData.balance || 0
        });
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          bio: userData.bio || ''
        });
      } catch (err) {
        setError('Failed to load profile');
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setNewAddress(prev => ({
      ...prev,
      latitude: location.lat,
      longitude: location.lng,
      address: location.address
    }));
  };

  const handleAddAddress = async (addressData: Address) => {
    try {
      // Use the addressService to add an address
      await addressService.addAddress(addressData);
      
      // Refresh the addresses list
      fetchAddresses();
      
      setShowAddAddress(false);
    } catch (err) {
      console.error('Error adding address:', err);
      setAddressError(err instanceof Error ? err.message : 'Failed to add address');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      // Use the addressService to delete an address
      await addressService.deleteAddress(id);
      
      // Refresh the addresses list
      fetchAddresses();
    } catch (err) {
      console.error('Error deleting address:', err);
      setAddressError(err instanceof Error ? err.message : 'Failed to delete address');
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      // Use the addressService to set an address as default
      await addressService.setDefaultAddress(id);
      
      // Refresh the addresses list
      fetchAddresses();
    } catch (err) {
      console.error('Error setting default address:', err);
      setAddressError(err instanceof Error ? err.message : 'Failed to set default address');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateSuccess(false);
    setUpdateError('');
    
    try {
      // Use the userService to update the profile
      const updatedUser = await userService.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio
      });
      
      setProfile({
        ...updatedUser,
        balance: updatedUser.balance || 0
      });
      setUpdateSuccess(true);
    } catch (err) {
      console.error('Profile update error:', err);
      setUpdateError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  const handleChangePassword = () => {
    setShowPasswordModal(true);
  };

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    setBalanceError('');
    setBalanceSuccess(false);
    
    if (!balanceAmount || isNaN(Number(balanceAmount)) || Number(balanceAmount) <= 0) {
      setBalanceError('გთხოვთ შეიყვანოთ სწორი თანხა');
      return;
    }
    
    try {
      // Here you would call your API to add funds to the user's balance
      // For now, we'll just simulate a successful response
      console.log(`Adding ${balanceAmount} to balance`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBalanceSuccess(true);
      setBalanceAmount('');
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setBalanceSuccess(false);
        setActiveSection('personal');
      }, 3000);
    } catch (err) {
      console.error('Error adding funds:', err);
      setBalanceError('თანხის დამატება ვერ მოხერხდა');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'personal':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-6">პირადი ინფორმაცია</h2>
              <form className="space-y-6" onSubmit={handleUpdateProfile}>
                {updateSuccess && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">Profile updated successfully!</span>
                  </div>
                )}
                {updateError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{updateError}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none peer text-gray-800"
                      placeholder=" "
                    />
                    <label className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${
                      formData.firstName ? '-top-2 text-xs text-purple-500' : 'top-3 text-base text-gray-500'
                    }`}>
                      სახელი
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none peer text-gray-800"
                      placeholder=" "
                    />
                    <label className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${
                      formData.email ? '-top-2 text-xs text-purple-500' : 'top-3 text-base text-gray-500'
                    }`}>
                      ელ-ფოსტა
                    </label>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none peer text-gray-800"
                    placeholder=" "
                  />
                  <label className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${
                    formData.phone ? '-top-2 text-xs text-purple-500' : 'top-3 text-base text-gray-500'
                  }`}>
                    ტელეფონის ნომერი
                  </label>
                </div>

                <div className="relative">
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none resize-none peer text-gray-800"
                    placeholder=" "
                  />
                  <label className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${
                    formData.bio ? '-top-2 text-xs text-purple-500' : 'top-3 text-base text-gray-500'
                  }`}>
                    Bio
                  </label>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      გაუქმება
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      პროფილის განახლება
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">უსაფრთხოება</h3>
              <button
                type="button"
                onClick={handleChangePassword}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                პაროლის ცვლილება
              </button>
            </div>
          </div>
        );
      case 'addresses':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg font-medium text-gray-900">ჩემი მისამართები</h2>
              <button
                onClick={() => setShowAddAddress(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
              >
                მისამართის დამატება
              </button>
            </div>

            {addressError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{addressError}</span>
              </div>
            )}

            <div className="space-y-4">
              {addresses.map((address) => (
                <div key={address.id} className="bg-white p-4 md:p-6 rounded-lg border border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                      <h3 className="text-md font-medium text-gray-900">{address.address}</h3>
                      {/* <p className="mt-1 text-gray-600">{address.address}</p> */}
                    </div>
                    <div className="flex flex-col items-start sm:items-end space-y-2 w-full sm:w-auto">
                      {address.isDefault && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          ძირითადი მისამართი
                        </span>
                      )}
                      <div className="flex space-x-2 w-full sm:w-auto justify-start sm:justify-end">
                        {!address.isDefault && (
                          <button
                            onClick={() => address.id && handleSetDefaultAddress(address.id)}
                            className="text-sm text-purple-600 hover:text-purple-800"
                          >
                            Set as Default
                          </button>
                        )}
                        <button
                          onClick={() => address.id && handleDeleteAddress(address.id)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {addresses.length === 0 && !showAddAddress && (
                <p className="text-gray-500 text-center py-4">No addresses added yet.</p>
              )}
            </div>

            <Modal 
              isOpen={showAddAddress} 
              onClose={() => setShowAddAddress(false)} 
              title="Add New Address"
            >
              <AddressForm 
                onSave={handleAddAddress} 
                onCancel={() => setShowAddAddress(false)} 
              />
            </Modal>
          </div>
        );
      case 'cards':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Side */}
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg p-4 md:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">ჩემი ბარათები</h2>
                <div className="space-y-4">
                  <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
                    ბარათის დამატება
                  </button>
                  <div className="mt-4">
                    <p className="text-gray-500">ბარათები დამატებული არ აქვს.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side */}
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg p-4 md:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Default Payment Method</h2>
                <div className="space-y-4">
                  <p className="text-gray-500">No default payment method set.</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'balance':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-6">ბალანსის შევსება</h2>
              <form className="space-y-6" onSubmit={handleAddFunds}>
                {balanceSuccess && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">თანხა წარმატებით დაემატა!</span>
                  </div>
                )}
                {balanceError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{balanceError}</span>
                  </div>
                )}
                <div className="relative max-w-[180px]">
                  <input
                    type="number"
                    name="balanceAmount"
                    value={balanceAmount}
                    onChange={(e) => setBalanceAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none peer text-gray-800"
                    placeholder=" "
                    min="0"
                    step="0.01"
                  />
                  <label className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${
                    balanceAmount ? '-top-2 text-xs text-purple-500' : 'top-3 text-base text-gray-500'
                  }`}>
                    თანხა (₾)
                  </label>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <div className="flex justify-end space-x-4">
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      შენახვა
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        );
      case 'orders':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">ჩემი შეკვეთები</h2>
            
            {ordersError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{ordersError}</span>
              </div>
            )}

            {ordersLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-gray-500">Loading orders...</div>
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order._id} className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between gap-4">
                      {/* Product Images */}
                      <div className="flex -space-x-2">
                        {order.items.slice(0, 3).map((item, index) => (
                          <div key={item._id} className="relative">
                            <img
                              src={item.images[0]}
                              alt={item.name}
                              className="w-12 h-12 rounded-full border-2 border-white object-cover"
                            />
                            {index === 2 && order.items.length > 3 && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                                <span className="text-white text-xs">+{order.items.length - 3}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Order Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              შეკვეთა #{order.orderId}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              order.paymentStatus === 'paid' ? 'bg-blue-100 text-blue-800' :
                              order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.paymentStatus === 'paid' ? 'Paid' :
                               order.paymentStatus === 'failed' ? 'Payment Failed' :
                               order.status === 'delivered' ? 'Delivered' :
                               order.status === 'cancelled' ? 'Cancelled' :
                               order.status === 'pending' ? 'pending' :
                               'Processing'}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            ₾{order.totalAmount.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                            <span className="text-sm text-gray-500">
                              {order.items.reduce((sum, item) => sum + item.quantity, 0)} ნივთი
                            </span>
                          </div>
                          <Link 
                            href={`/order-confirmation/${order._id}`}
                            className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                          >
                            დეტალურად →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">შეკვეთა ვერ მოიძებნა.</p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white shadow rounded-lg p-4 md:p-6">
              {/* User Profile Summary */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex flex-col items-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-white mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                   </div>
                  <h2 className="text-lg font-semibold text-gray-800 text-center">{profile?.firstName || 'მომხმარებელი'}</h2>
                </div>
                
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg mt-4 border border-gray-200 mx-auto" style={{ maxWidth: '180px' }}>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 text-xs">ბალანსი</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-800 mr-2">{profile?.balance.toFixed(2) || '0.00'} ₾</span>
                    <button 
                      className="text-purple-600 hover:text-purple-800"
                      onClick={() => setActiveSection('balance')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <nav className="space-y-2">
              <button
                  onClick={() => setActiveSection('orders')}
                  className={`w-full text-left px-4 py-2 rounded-md text-sm ${
                    activeSection === 'orders'
                      ? 'bg-purple-100 font-bold text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  ჩემი შეკვეთები
                </button>
                <button
                  onClick={() => setActiveSection('personal')}
                  className={`w-full text-left px-4 py-2 rounded-md text-sm ${
                    activeSection === 'personal'
                      ? 'bg-purple-100 font-bold text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  პირადი ინფორმაცია
                </button>
                <button
                  onClick={() => setActiveSection('addresses')}
                  className={`w-full text-left px-4 py-2 rounded-md text-sm ${
                    activeSection === 'addresses'
                      ? 'bg-purple-100 font-bold text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                    მისამართები
                </button>
                <button
                  onClick={() => setActiveSection('cards')}
                  className={`w-full text-left px-4 py-2 rounded-md text-sm ${
                    activeSection === 'cards'
                      ? 'bg-purple-100 font-bold text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                    ჩემი ბარათები
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white shadow rounded-lg p-4 md:p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      <PasswordChangeModal 
        isOpen={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)} 
      />
    </div>
  );
} 