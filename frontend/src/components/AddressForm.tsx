'use client';

import { useState } from 'react';
import GoogleMap from './GoogleMap';

interface Address {
  id?: string;
  title: string;
  address: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

interface AddressFormProps {
  onSave: (address: Address) => void;
  onCancel: () => void;
  initialAddress?: Address;
}

export default function AddressForm({ onSave, onCancel, initialAddress }: AddressFormProps) {
  const [address, setAddress] = useState<Address>({
    title: initialAddress?.title || '',
    address: initialAddress?.address || '',
    latitude: initialAddress?.latitude || 0,
    longitude: initialAddress?.longitude || 0,
    isDefault: initialAddress?.isDefault || false
  });

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setAddress(prev => ({
      ...prev,
      latitude: location.lat,
      longitude: location.lng,
      address: location.address
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(address);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="relative">
        <input
          type="text"
          value={address.title}
          onChange={(e) => setAddress(prev => ({ ...prev, title: e.target.value }))}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none peer text-gray-800"
          placeholder=" "
          required
        />
        <label className={`absolute left-4 transition-all duration-200 pointer-events-none bg-white px-1 ${
          address.title ? '-top-2 text-xs text-purple-500' : 'top-3 text-base text-gray-500'
        }`}>
          Address Title
        </label>
      </div>

      <GoogleMap onLocationSelect={handleLocationSelect} />

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isDefault"
          checked={address.isDefault}
          onChange={(e) => setAddress(prev => ({ ...prev, isDefault: e.target.checked }))}
          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
        />
        <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
          Set as default address
        </label>
      </div>

      <div className="flex justify-end space-x-4">
      
        <button
          type="submit"
          className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
        >
          Save Address
        </button>
      </div>
    </form>
  );
} 