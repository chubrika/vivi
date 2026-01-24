'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { isAuthenticated, hasRole } from '../../utils/authContext';
import type { User } from '../../types/user';
import { API_BASE_URL } from '../../utils/api';
import { userService } from '../../services/userService';
import { sellerProfileService, type SellerProfileDocument } from '../../services/sellerProfileService';
import { addressService, Address } from '../../services/addressService';
import { orderService, Order } from '../../services/orderService';
import Link from 'next/link';
import GoogleMap from '../../components/GoogleMap';
import Modal from '../../components/Modal';
import AddressForm from '../../components/AddressForm';
import PasswordChangeModal from '../../components/PasswordChangeModal';

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<User | null>(null);
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
    phoneNumber: '',
    personalNumber: '',
    storeName: '',
    sellerPhone: '',
    sellerDocuments: [] as SellerProfileDocument[]
  });
  const [originalFormData, setOriginalFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    personalNumber: '',
    storeName: '',
    sellerPhone: '',
    sellerDocuments: [] as SellerProfileDocument[]
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

  // Helper: customer = has user role (or no roles) and no seller/courier/admin
  const isCustomer = (): boolean => {
    if (!profile) return false;
    const special = hasRole(profile, 'seller') || hasRole(profile, 'courier') || hasRole(profile, 'admin');
    return !special && (hasRole(profile, 'user') || !profile.roles?.length);
  };

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

  // Set active section from URL parameter
  useEffect(() => {
    const section = searchParams?.get('section');
    if (section && ['personal', 'orders', 'addresses', 'cards'].includes(section)) {
      setActiveSection(section);
    }
  }, [searchParams]);

  // Function to update URL and set active section
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    const url = new URL(window.location.href);
    url.searchParams.set('section', section);
    window.history.pushState({}, '', url.toString());
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated()) {
        router.push('/login');
        return;
      }

      try {
        // Use the userService to fetch the profile
        const userData = await userService.getCurrentUser() as any;
        console.log('Fetched user data:', userData);
        
        // Normalize roles - handle both old (role) and new (roles) structures
        let normalizedRoles: string[] = [];
        if (userData.roles && Array.isArray(userData.roles)) {
          // New structure: roles array exists
          normalizedRoles = userData.roles;
        } else if (userData.role && typeof userData.role === 'string') {
          // Old structure: convert role string to roles array
          normalizedRoles = [userData.role];
        } else {
          // Default fallback
          normalizedRoles = ['user'];
        }
        
        setProfile({
          ...userData,
          roles: normalizedRoles,
          balance: userData.balance || 0
        });
        const rawDocs = userData.sellerProfile?.documents;
        const sellerDocuments: SellerProfileDocument[] = Array.isArray(rawDocs)
          ? rawDocs.map((d: any) => ({
              id: d.id || `doc-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              type: (d.type === 'id' || d.type === 'company' || d.type === 'bank' ? d.type : 'id') as 'id' | 'company' | 'bank',
              url: d.url || '',
              uploadedAt: d.uploadedAt ? (typeof d.uploadedAt === 'string' ? d.uploadedAt : new Date(d.uploadedAt).toISOString()) : new Date().toISOString()
            }))
          : [];
        const initialFormData = {
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phoneNumber: userData.phoneNumber || '',
          personalNumber: userData.personalNumber || '',
          storeName: userData.sellerProfile?.storeName || '',
          sellerPhone: userData.sellerProfile?.phone || '',
          sellerDocuments
        };
        setFormData(initialFormData);
        setOriginalFormData(initialFormData);
        console.log('Set form data:', initialFormData);
      } catch (err) {
        setError('Failed to load profile');
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addSellerDocument = () => {
    setFormData(prev => ({
      ...prev,
      sellerDocuments: [...prev.sellerDocuments, { id: `new-${Date.now()}`, type: 'id', url: '', uploadedAt: new Date().toISOString() }]
    }));
  };
  const removeSellerDocument = (index: number) => {
    setFormData(prev => ({ ...prev, sellerDocuments: prev.sellerDocuments.filter((_, i) => i !== index) }));
  };
  const updateSellerDocument = (index: number, field: 'type' | 'text', value: string) => {
    setFormData(prev => ({
      ...prev,
      sellerDocuments: prev.sellerDocuments.map((d, i) => i === index ? { ...d, [field]: value } : d)
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
      // Sellers: do not send firstName, lastName, personalNumber, phoneNumber
      const updatePayload: Parameters<typeof userService.updateProfile>[0] = {
        email: formData.email
      };
      if (!hasRole(profile, 'seller')) {
        updatePayload.phoneNumber = formData.phoneNumber;
        updatePayload.firstName = formData.firstName;
        updatePayload.lastName = formData.lastName;
        updatePayload.personalNumber = formData.personalNumber;
      }
      const updatedUser = await userService.updateProfile(updatePayload);

      // Normalize roles for updated user
      const updatedUserAny = updatedUser as any;
      let normalizedRoles: string[] = [];
      if (updatedUserAny.roles && Array.isArray(updatedUserAny.roles)) {
        normalizedRoles = updatedUserAny.roles;
      } else if (updatedUserAny.role && typeof updatedUserAny.role === 'string') {
        normalizedRoles = [updatedUserAny.role];
      } else {
        normalizedRoles = ['user'];
      }

      let profileToSet: User = {
        ...updatedUserAny,
        _id: (updatedUserAny._id || updatedUserAny.id) as string,
        roles: normalizedRoles,
        balance: updatedUserAny.balance || 0
      };

      // Sellers: if any seller field changed, update via seller profile API
      const sellerChanged =
        formData.storeName !== originalFormData.storeName ||
        formData.sellerPhone !== originalFormData.sellerPhone ||
        JSON.stringify(formData.sellerDocuments) !== JSON.stringify(originalFormData.sellerDocuments);
      if (hasRole(profile, 'seller') && sellerChanged) {
        try {
          const { sellerProfile: updatedSp } = await sellerProfileService.updateMyProfile({
            storeName: formData.storeName,
            phone: formData.sellerPhone,
            documents: formData.sellerDocuments
          });
          profileToSet = {
            ...profileToSet,
            sellerProfile: { ...(profileToSet.sellerProfile || {}), ...updatedSp, storeName: updatedSp.storeName, phone: updatedSp.phone, documents: updatedSp.documents || [] }
          } as User;
        } catch (spErr) {
          setUpdateError(spErr instanceof Error ? spErr.message : 'Failed to update seller profile');
          return;
        }
      }

      setProfile(profileToSet);
      setOriginalFormData({ ...formData });
      setUpdateSuccess(true);
    } catch (err) {
      console.error('Profile update error:', err);
      setUpdateError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  const handleChangePassword = () => {
    setShowPasswordModal(true);
  };

  // Check if form has been modified (sellers: no phoneNumber, personalNumber; user/others: all)
  const isFormModified = () => {
    const base = formData.email !== originalFormData.email;
    if (hasRole(profile, 'seller')) {
      return (
        base ||
        formData.storeName !== originalFormData.storeName ||
        formData.sellerPhone !== originalFormData.sellerPhone ||
        JSON.stringify(formData.sellerDocuments) !== JSON.stringify(originalFormData.sellerDocuments)
      );
    }
    return (
      base ||
      formData.phoneNumber !== originalFormData.phoneNumber ||
      formData.personalNumber !== originalFormData.personalNumber ||
      formData.firstName !== originalFormData.firstName ||
      formData.lastName !== originalFormData.lastName
    );
  };

  // Reset form to original values
  const handleCancel = () => {
    setFormData(originalFormData);
    setUpdateError('');
    setUpdateSuccess(false);
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
    console.log('Current form data:', formData);
    console.log('Current profile:', profile);
    
    switch (activeSection) {
      case 'personal':
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center mb-6">
                <svg className="w-6 h-6 text-sky-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h2 className="text-lg font-medium text-gray-900">პირადი ინფორმაცია</h2>
              </div>
              <form className="space-y-6" onSubmit={handleUpdateProfile}>
                {updateSuccess && (
                  <div className="bg-sky-100 border border-sky-400 text-sky-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">Profile updated successfully!</span>
                  </div>
                )}
                {updateError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{updateError}</span>
                  </div>
                )}
                {/* Sellers: show sellerName input; user/others: show firstName & lastName */}
                {hasRole(profile, 'seller') ? (
                  <>
                    <div className="relative">
                      <input
                        type="text"
                        name="storeName"
                        value={formData.storeName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all duration-200 outline-none peer text-gray-800"
                        placeholder=" "
                      />
                      <label className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${formData.storeName ? '-top-2 text-xs text-sky-500' : 'top-3 text-base text-gray-500'}`}>
                        გამყიდველის სახელი
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type="tel"
                        name="sellerPhone"
                        value={formData.sellerPhone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all duration-200 outline-none peer text-gray-800"
                        placeholder=" "
                      />
                      <label className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${formData.sellerPhone ? '-top-2 text-xs text-sky-500' : 'top-3 text-base text-gray-500'}`}>
                        გამყიდველის ტელეფონი
                      </label>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4 bg-gray-50/50">
                      <div className="text-sm font-medium text-gray-700 mb-2">დოკუმენტები</div>
                      {formData.sellerDocuments.map((doc, i) => (
                        <div key={doc.id} className="flex flex-wrap items-center gap-2 mt-2 p-2 bg-white rounded border border-gray-200">
                          <select
                            value={doc.type}
                            onChange={e => updateSellerDocument(i, 'type', e.target.value)}
                            className="px-2 text-gray-800 py-1.5 border border-gray-300 rounded text-sm"
                          >
                            <option value="id">პირადი მოწმობა</option>
                            <option value="company">კომპანიის სერტიფიკატი</option>
                            <option value="bank">საბანკო</option>
                          </select>
                          <input
                            type="text"
                            value={doc.url}
                            onChange={e => updateSellerDocument(i, 'text', e.target.value)}
                            placeholder="URL"
                            className="flex-1 text-gray-800 min-w-[120px] px-2 py-1.5 border border-gray-300 rounded text-sm"
                          />
                          <button type="button" onClick={() => removeSellerDocument(i)} className="text-red-600 hover:text-red-800 text-sm">
                            წაშლა
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={addSellerDocument} className="mt-2 text-sm text-sky-600 hover:text-sky-800">
                        + დოკუმენტის დამატება
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all duration-200 outline-none peer text-gray-800"
                        placeholder=" "
                      />
                      <label className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${formData.firstName ? '-top-2 text-xs text-sky-500' : 'top-3 text-base text-gray-500'
                        }`}>
                        სახელი
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all duration-200 outline-none peer text-gray-800"
                        placeholder=" "
                      />
                      <label className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${formData.lastName ? '-top-2 text-xs text-sky-500' : 'top-3 text-base text-gray-500'
                        }`}>
                        გვარი
                      </label>
                    </div>
                  </div>
                )}

                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all duration-200 outline-none peer text-gray-800"
                    placeholder=" "
                  />
                  <label className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${formData.email ? '-top-2 text-xs text-sky-500' : 'top-3 text-base text-gray-500'
                    }`}>
                    ელ-ფოსტა
                  </label>
                </div>

                {!hasRole(profile, 'seller') && (
                  <div className="relative">
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all duration-200 outline-none peer text-gray-800"
                      placeholder=" "
                    />
                    <label className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${formData.phoneNumber ? '-top-2 text-xs text-sky-500' : 'top-3 text-base text-gray-500'}`}>
                      ტელეფონის ნომერი
                    </label>
                  </div>
                )}

                {!hasRole(profile, 'seller') && (
                  <div className="relative">
                    <input
                      type="text"
                      name="personalNumber"
                      value={formData.personalNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all duration-200 outline-none peer text-gray-800"
                      placeholder=" "
                    />
                    <label className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${formData.personalNumber ? '-top-2 text-xs text-sky-500' : 'top-3 text-base text-gray-500'}`}>
                      პირადი ნომერი
                    </label>
                  </div>
                )}

                <div className="pt-6 border-t border-gray-200">
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={!isFormModified()}
                      className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 ${
                        isFormModified()
                          ? 'text-gray-700 bg-white hover:bg-gray-50'
                          : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                      }`}
                    >
                      გაუქმება
                    </button>
                    <button
                      type="submit"
                      disabled={!isFormModified()}
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 ${
                        isFormModified()
                          ? 'text-white bg-sky-600 hover:bg-sky-700'
                          : 'text-gray-400 bg-gray-300 cursor-not-allowed'
                      }`}
                    >
                      პროფილის განახლება
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-center mb-4">
                <svg className="w-5 h-5 text-sky-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900">უსაფრთხოება</h3>
              </div>
              <button
                type="button"
                onClick={handleChangePassword}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
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
              <div className="flex items-center">
                <svg className="w-6 h-6 text-sky-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h2 className="text-lg font-medium text-gray-900">ჩემი მისამართები</h2>
              </div>
              <button
                onClick={() => setShowAddAddress(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700"
              >
                მისამართის დამატება
              </button>
            </div>

            {addressError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{addressError}</span>
              </div>
            )}

            {addresses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((address) => (
                  <div key={address._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{address.title}</h3>
                      {address.isDefault && (
                        <span className="bg-sky-100 text-sky-800 text-xs px-2 py-1 rounded-full">
                          მთავარი
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{address.address}</p>
                    <div className="flex space-x-2">
                      {!address.isDefault && (
                        <button
                          onClick={() => handleSetDefaultAddress(address.id || address._id || '')}
                          className="text-sm text-sky-600 hover:text-sky-800"
                        >
                          მთავარი გახადე
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAddress(address.id || address._id || '')}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        წაშლა
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">მისამართი ვერ მოიძებნა.</p>
                <button
                  onClick={() => setShowAddAddress(true)}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700"
                >
                  პირველი მისამართის დამატება
                </button>
              </div>
            )}
          </div>
        );
      case 'orders':
        return (
          <div className="space-y-6">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-sky-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h2 className="text-lg font-medium text-gray-900">ჩემი შეკვეთები</h2>
            </div>
            
            {ordersLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
              </div>
            ) : ordersError ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{ordersError}</span>
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">შეკვეთა #{order._id.slice(-8)}</h3>
                        <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('ka-GE')}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'processing' ? 'bg-sky-100 text-sky-800' :
                        order.status === 'shipped' ? 'bg-sky-100 text-sky-800' :
                        order.status === 'delivered' ? 'bg-sky-100 text-sky-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status === 'pending' ? 'მიმდინარე' :
                         order.status === 'processing' ? 'დამუშავებაში' :
                         order.status === 'shipped' ? 'გაგზავნილი' :
                         order.status === 'delivered' ? 'მიწოდებული' :
                         order.status === 'cancelled' ? 'გაუქმებული' :
                         order.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{order.totalAmount.toFixed(2)} ₾</span>
                        <span className="mx-2">•</span>
                        <span>{order.items.length} ნაწილი</span>
                      </div>
                      <Link
                        href={`/order-confirmation/${order._id}`}
                        className="text-sm text-sky-600 hover:text-sky-800 font-medium"
                      >
                        დეტალურად →
                      </Link>
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
      case 'cards':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-sky-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <h2 className="text-lg font-medium text-gray-900">ჩემი ბარათები</h2>
              </div>
              <button
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700"
              >
                ბარათის დამატება
              </button>
            </div>
            
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <p className="text-gray-500 mb-4">ბარათი ვერ მოიძებნა</p>
              <p className="text-sm text-gray-400">დაამატეთ საკრედიტო ან დებეტური ბარათი უსაფრთხო გადახდებისთვის</p>
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
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white shadow rounded-lg p-4 md:p-6">
              {/* User Profile Summary */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex flex-col items-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-sky-600 flex items-center justify-center text-white mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800 text-center">
                    {hasRole(profile, 'seller')
                      ? (profile?.sellerProfile?.storeName || 'მომხმარებელი')
                      : ([profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim() || 'მომხმარებელი')}
                  </h2>
                </div>

                {isCustomer() && (
                  <>
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg mt-4 border border-gray-200 mx-auto" style={{ maxWidth: '180px' }}>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 text-xs">ბალანსი</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-semibold text-gray-800 mr-2">{(profile?.balance ?? 0).toFixed(2)} ₾</span>
                        <button
                          className="text-sky-600 hover:text-sky-800"
                          onClick={() => setActiveSection('balance')}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <nav className="space-y-1">
                {(hasRole(profile, 'seller') || profile?.sellerProfile) && (
                  <>
                    <Link
                      href="/seller/dashboard"
                      className="w-full text-left px-4 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      გამყიდველის პანელი
                    </Link>
                    <Link
                      href="/seller/profile"
                      className="w-full text-left px-4 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      გამყიდველის პროფილი
                      {profile?.sellerProfile && (
                        <span className={`ml-auto px-2 py-1 rounded-full text-xs font-medium ${
                          profile.sellerProfile.status === 'approved' ? 'bg-green-100 text-green-800' :
                          profile.sellerProfile.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          profile.sellerProfile.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {profile.sellerProfile.status === 'approved' ? 'დამტკიცებული' :
                           profile.sellerProfile.status === 'pending' ? 'მოლოდინში' :
                           profile.sellerProfile.status === 'rejected' ? 'უარყოფილი' :
                           'დაბლოკილი'}
                        </span>
                      )}
                    </Link>
                  </>
                )}
                {hasRole(profile, 'courier') && (
                  <Link
                    href="/courier/orders"
                    className="w-full text-left px-4 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    კურიერის პანელი
                  </Link>
                )}
                {!hasRole(profile, 'seller') && !hasRole(profile, 'courier') && (
                  <button
                    onClick={() => handleSectionChange('orders')}
                    className={`w-full text-left px-4 py-2 rounded-md text-sm flex items-center ${activeSection === 'orders'
                        ? 'bg-sky-100 font-bold text-sky-700'
                        : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    ჩემი შეკვეთები
                  </button>
                )}
                <button
                  onClick={() => handleSectionChange('personal')}
                  className={`w-full text-left px-4 py-2 rounded-md text-sm flex items-center ${activeSection === 'personal'
                      ? 'bg-sky-100 font-bold text-sky-700'
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  პირადი ინფორმაცია
                </button>
                <button
                  onClick={() => handleSectionChange('addresses')}
                  className={`w-full text-left px-4 py-2 rounded-md text-sm flex items-center ${activeSection === 'addresses'
                      ? 'bg-sky-100 font-bold text-sky-700'
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  მისამართები
                </button>
                <button
                  onClick={() => handleSectionChange('cards')}
                  className={`w-full text-left px-4 py-2 rounded-md text-sm flex items-center ${activeSection === 'cards'
                      ? 'bg-sky-100 font-bold text-sky-700'
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
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

      {/* Address Modal */}
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

      {/* Password Change Modal */}
      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
} 