'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../utils/authContext';
import { authService } from '../services/authService';
import { X, Mail, Lock, Eye, EyeOff, Building, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

interface LoginSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'login' | 'register';

export default function LoginSidebar({ isOpen, onClose }: LoginSidebarProps) {
  const router = useRouter();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'customer' as 'customer' | 'seller',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle body overflow when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore overflow when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log(`${activeTab === 'login' ? 'Login' : 'Registration'} attempt for:`, formData.email);
      
      const data = activeTab === 'login' 
        ? await authService.login({ email: formData.email, password: formData.password })
        : await authService.register(formData);

      console.log(`${activeTab === 'login' ? 'Login' : 'Registration'} successful:`, data);
      
      const cleanToken = data.token.replace('Bearer ', '');
      login(cleanToken, data.user);
      console.log('User logged in successfully after', activeTab);
      
      // Show success notification
      if (activeTab === 'register') {
        toast.success(`🎉 რეგისტრაცია წარმატებით დასრულდა! მოგესალმებთ!`);
      } else {
        toast.success(`👋 კეთილი იყოს თქვენი დაბრუნება!`);
      }
      
      // Close sidebar
      onClose();
      
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
    setFormData({
      ...formData,
      role,
    });
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setError('');
    setFormData({ email: '', password: '', role: 'customer' });
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed bottom-0 left-0 right-0 h-[80vh] md:bottom-auto md:left-auto md:right-0 md:top-0 md:h-full md:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out rounded-t-3xl md:rounded-none ${
        isOpen ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
                <LogIn className="h-5 w-5 text-sky-600" />
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => handleTabChange('login')}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                activeTab === 'login'
                  ? 'text-sky-600 border-b-2 border-sky-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              შესვლა
            </button>
            <button
              onClick={() => handleTabChange('register')}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                activeTab === 'register'
                  ? 'text-sky-600 border-b-2 border-sky-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              რეგისტრაცია
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Register: role only (new structure: customer -> user, seller -> userType seller + SellerProfile) */}
              {activeTab === 'register' && (
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
                      <Building className="h-4 w-4 inline mr-2" />
                      გამყიდველი
                    </button>
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  ელ-ფოსტა
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="block text-gray-900 w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="თქვენი ელ-ფოსტა"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  პაროლი
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="block text-gray-900 w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="თქვენი პაროლი"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-sky-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'მუშაობს...' : activeTab === 'login' ? 'შესვლა' : 'რეგისტრაცია'}
              </button>
            </form>

            {/* Switch Tab Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                {activeTab === 'login' ? 'პირველად შოპინგობ?' : 'უკვე ხარ რეგისტრირებული?'}{' '}
                <button
                  onClick={() => handleTabChange(activeTab === 'login' ? 'register' : 'login')}
                  className="font-medium text-sky-600 hover:text-sky-500 transition-colors"
                >
                  {activeTab === 'login' ? 'დარეგისტრირდი' : 'შესვლა'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}