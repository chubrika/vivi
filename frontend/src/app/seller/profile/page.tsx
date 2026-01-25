'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../utils/authContext';
import { sellerProfileService, SellerProfile } from '../../../services/sellerProfileService';

export default function SellerProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [formData, setFormData] = useState({
    storeName: '',
    phone: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await sellerProfileService.getMyProfile();
        setProfile(data);
        setFormData({
          storeName: data.storeName || '',
          phone: data.phone || '',
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const result = await sellerProfileService.updateMyProfile(formData);
      setProfile(result.sellerProfile);
      setSuccess(result.message || 'Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'suspended':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'დამტკიცებული';
      case 'pending':
        return 'მოლოდინში';
      case 'rejected':
        return 'უარყოფილი';
      case 'suspended':
        return 'დაბლოკილი';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Seller Profile Not Found</h2>
          <p className="text-gray-600">Please contact support if you believe this is an error.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">გამყიდველის პროფილი</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(profile.status)}`}>
            {getStatusLabel(profile.status)}
          </span>
        </div>

        {profile.status !== 'pending' && (
          <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded">
            <p className="text-sm">
              {profile.status === 'approved' 
                ? 'თქვენი პროფილი დამტკიცებულია. შეგიძლიათ პროდუქტების დამატება.'
                : profile.status === 'rejected'
                ? 'თქვენი პროფილი უარყოფილია. გთხოვთ დაუკავშირდეთ ადმინისტრაციას.'
                : 'თქვენი პროფილი დაბლოკილია. გთხოვთ დაუკავშირდეთ ადმინისტრაციას.'}
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          {profile.status === 'pending' && (
            <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
              <p className="text-sm">
                თქვენი პროფილი მოლოდინშია. გთხოვთ შეავსოთ ინფორმაცია და დაელოდოთ ადმინისტრაციის დამტკიცებას.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="storeName" className="block text-sm font-medium text-gray-700">
                გამყიდველის სახელი *
              </label>
              <input
                type="text"
                name="storeName"
                id="storeName"
                value={formData.storeName}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                placeholder="გამყიდველის სახელი"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                ტელეფონის ნომერი *
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                placeholder="+995 5XX XX XX XX"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-200">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div>
                <dt className="font-medium text-gray-500">სტატუსი</dt>
                <dd>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(profile.status)}`}>
                    {getStatusLabel(profile.status)}
                  </span>
                </dd>
              </div>
              {profile.approvedAt && (
                <div>
                  <dt className="font-medium text-gray-500">დამტკიცების თარიღი</dt>
                  <dd className="text-gray-900">{new Date(profile.approvedAt).toLocaleDateString('ka-GE')}</dd>
                </div>
              )}
            </dl>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50"
            >
              {saving ? 'შენახვა...' : 'შენახვა'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 