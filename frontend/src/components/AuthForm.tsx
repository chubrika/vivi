'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../utils/authContext';
import { authService } from '../services/authService';

interface AuthFormProps {
  type: 'login' | 'register';
}

export default function AuthForm({ type }: AuthFormProps) {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'customer' as 'customer' | 'seller',
    businessName: '',
    businessAddress: '',
    phoneNumber: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = type === 'login' 
        ? await authService.login(formData)
        : await authService.register(formData);

      const cleanToken = data.token.replace('Bearer ', '');
      login(cleanToken, data.user);
      console.log('User logged in successfully');
      
      // Redirect based on role
      if (data.user.role === 'admin') {
        router.push('/admin');
      } else if (data.user.role === 'seller') {
        router.push('/seller/dashboard');
      } else {
        router.push('/');
      }
    } catch (err: Error | unknown) {
      console.error('Authentication error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (role: 'customer' | 'seller') => {
    setFormData({
      ...formData,
      role,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {type === 'login' ? 'Sign in to your account' : 'Create your account'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {type === 'register' && (
            <div className="mb-4">
              <div className="sm:hidden">
                <label htmlFor="role" className="sr-only">Account Type</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-purple-500 focus:outline-none focus:ring-purple-500 sm:text-sm"
                >
                  <option value="customer">მომხმარებელი</option>
                  <option value="seller">მაღაზია</option>
                </select>
              </div>
              <div className="hidden sm:block">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                      type="button"
                      onClick={() => handleRoleChange('customer')}
                      className={`${
                        formData.role === 'customer'
                          ? 'border-purple-500 text-purple-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                      მომხმარებელი
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRoleChange('seller')}
                      className={`${
                        formData.role === 'seller'
                          ? 'border-purple-500 text-purple-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                      მაღაზია
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            {type === 'register' && (
              <>
                {formData.role === 'customer' && (
                  <>
                    <div>
                      <label htmlFor="firstName" className="sr-only">სახელი</label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                        placeholder="სახელი"
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="sr-only">გვარი</label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                        placeholder="გვარი"
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                    </div>
                  </>
                )}
                {formData.role === 'seller' && (
                  <>
                    <div>
                      <label htmlFor="businessName" className="sr-only">Business Name</label>
                      <input
                        id="businessName"
                        name="businessName"
                        type="text"
                        required
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                        placeholder="მაღაზიის სახელი"
                        value={formData.businessName}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="businessAddress" className="sr-only">Business Address</label>
                      <input
                        id="businessAddress"
                        name="businessAddress"
                        type="text"
                        required
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                        placeholder="მაღაზიის მისამართი"
                        value={formData.businessAddress}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="phoneNumber" className="sr-only">ტელეფონის ნომერი</label>
                      <input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        required
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                        placeholder="ტელეფონის ნომერი"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                      />
                    </div>
                  </>
                )}
              </>
            )}
            <div>
              <label htmlFor="email" className="sr-only">ელ-ფოსტა</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm ${
                  type === 'register' ? '' : 'rounded-t-md'
                }`}
                placeholder="ელ-ფოსტა"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">პაროლი</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="პაროლი"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              {loading ? 'მუშაობს...' : type === 'login' ? 'შესვლა' : 'რეგისტრაცია'}
            </button>
          </div>

          <div className="text-center">
            <Link 
              href={type === 'login' ? '/register' : '/login'}
              className="font-medium text-purple-600 hover:text-purple-500"
            >
              {type === 'login' 
                ? "პირველად შოპინგობ? დარეგისტრირდი" 
                : 'უკვე ხარ რეგისტრირებული? შესვლა'}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 