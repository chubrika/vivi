'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getToken } from '../../utils/authContext';
import { API_BASE_URL } from '../../utils/api';
import Link from 'next/link';
import GoogleMap from '../../components/GoogleMap';
import Modal from '../../components/Modal';
import AddressForm from '../../components/AddressForm';

interface UserProfile {
  name: string;
  email: string;
  // Add more fields as needed
}

interface Address {
  id?: string;
  title: string;
  address: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('personal');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    title: '',
    address: '',
    latitude: 0,
    longitude: 0,
    isDefault: false
  });
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    phone: '',
    bio: ''
  });

  // Function to fetch addresses
  const fetchAddresses = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/addresses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch addresses');
      }

      const data = await response.json();
      setAddresses(data);
    } catch (err) {
      console.error('Error fetching addresses:', err);
      setError('Failed to load addresses');
    }
  };

  // Fetch addresses when the addresses section is selected
  useEffect(() => {
    if (activeSection === 'addresses') {
      fetchAddresses();
    }
  }, [activeSection]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated()) {
        router.push('/login');
        return;
      }

      try {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setProfile(data);
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          bio: data.bio || ''
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
      console.log('Adding address with data:', addressData);
      const token = getToken();
      console.log('Using token:', token ? 'Token exists' : 'No token');

      const response = await fetch(`${API_BASE_URL}/api/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: addressData.title,
          address: addressData.address,
          latitude: addressData.latitude,
          longitude: addressData.longitude,
          isDefault: addressData.isDefault
        })
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned an invalid response');
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || `Failed to add address: ${response.status}`);
      }

      const data = await response.json();
      console.log('Address added successfully:', data);
      
      // Refresh the addresses list instead of manually adding the new address
      fetchAddresses();
      
      setShowAddAddress(false);
    } catch (err) {
      console.error('Error adding address:', err);
      setError(err instanceof Error ? err.message : 'Failed to add address');
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
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
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
              </form>
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

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">უსაფრთხოება</h3>
              <button
                type="button"
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
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">ჩემი მისამართები</h2>
              <button
                onClick={() => setShowAddAddress(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
              >
                მისამართის დამატება
              </button>
            </div>

            <div className="space-y-4">
              {addresses.map((address) => (
                <div key={address.id} className="bg-white p-6 rounded-lg shadow-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{address.title}</h3>
                      <p className="mt-1 text-gray-600">{address.address}</p>
                    </div>
                    {address.isDefault && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-md font-medium bg-purple-100 text-purple-800">
                        ძირითადი მისამართი
                      </span>
                    )}
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
          <div className="grid grid-cols-2 gap-6">
            {/* Left Side */}
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
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
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Default Payment Method</h2>
                <div className="space-y-4">
                  <p className="text-gray-500">No default payment method set.</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white shadow rounded-lg p-6">
              <h1 className="text-xl font-bold text-gray-900 mb-6">ჩემი პროფილი</h1>
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveSection('personal')}
                  className={`w-full text-left px-4 py-2 rounded-md ${
                    activeSection === 'personal'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  პირადი ინფორმაცია
                </button>
                <button
                  onClick={() => setActiveSection('addresses')}
                  className={`w-full text-left px-4 py-2 rounded-md ${
                    activeSection === 'addresses'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                    მისამართები
                </button>
                <button
                  onClick={() => setActiveSection('cards')}
                  className={`w-full text-left px-4 py-2 rounded-md ${
                    activeSection === 'cards'
                      ? 'bg-purple-100 text-purple-700'
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
            <div className="bg-white shadow rounded-lg p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 