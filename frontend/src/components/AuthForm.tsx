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
    email: '',
    password: '',
    role: 'customer' as 'customer' | 'seller',
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
        ? await authService.login({ email: formData.email, password: formData.password })
        : await authService.register(formData);

      console.log(`${type === 'login' ? 'Login' : 'Registration'} successful:`, data);
      
      const cleanToken = data.token.replace('Bearer ', '');
      login(cleanToken, data.user);
      console.log('User logged in successfully after', type);
      
      // Show success notification
      if (type === 'register') {
        toast.success(`🎉 რეგისტრაცია წარმატებით დასრულდა! მოგესალმებთ!`);
      } else {
        toast.success(`👋 კეთილი იყოს თქვენი დაბრუნება!`);
      }
      
      // Redirect based on roles (handle both old and new structures)
      const userData = data.user as any;
      const userRoles = userData.roles && Array.isArray(userData.roles)
        ? userData.roles
        : (userData.role ? [userData.role] : ['user']);
      if (userRoles.includes('admin')) {
        router.push('/admin');
      } else if (userRoles.includes('seller')) {
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
    setFormData({ ...formData, role });
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
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">ანგარიშის ტიპი</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleRoleChange('customer')}
                  className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                    formData.role === 'customer'
                      ? 'border-sky-500 bg-sky-50 text-sky-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  მომხმარებელი
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('seller')}
                  className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                    formData.role === 'seller'
                      ? 'border-sky-500 bg-sky-50 text-sky-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  გამყიდველი
                </button>
              </div>
            </div>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">ელ-ფოსტა</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm"
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