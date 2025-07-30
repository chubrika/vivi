'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../utils/authContext';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

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
      console.log(`${type === 'login' ? 'Login' : 'Registration'} attempt for:`, formData.email);
      
      const data = type === 'login' 
        ? await authService.login(formData)
        : await authService.register(formData);

      console.log(`${type === 'login' ? 'Login' : 'Registration'} successful:`, data);
      
      const cleanToken = data.token.replace('Bearer ', '');
      login(cleanToken, data.user);
      console.log('User logged in successfully after', type);
      
      // Show success notification
      if (type === 'register') {
        toast.success(`🎉 რეგისტრაცია წარმატებით დასრულდა! მოგესალმებთ ${data.user.firstName}!`);
      } else {
        toast.success(`👋 კეთილი იყოს თქვენი დაბრუნება, ${data.user.firstName}!`);
      }
      
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
                  className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm"
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
                          ? 'border-sky-500 text-sky-600'
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
                          ? 'border-sky-500 text-sky-600'
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
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm"
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
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm"
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
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm"
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
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm"
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
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm"
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
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm ${
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm"
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
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            >
              {loading ? 'მუშაობს...' : type === 'login' ? 'შესვლა' : 'რეგისტრაცია'}
            </button>
          </div>

          <div className="text-center">
            <Link 
              href={type === 'login' ? '/register' : '/login'}
              className="font-medium text-sky-600 hover:text-sky-500"
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