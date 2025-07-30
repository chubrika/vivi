'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../utils/authContext';
import { API_BASE_URL } from '../../utils/api';

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSellerAccess = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/check-seller`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          router.push('/login');
          return;
        }

        // We don't need to use the response data as the role is managed by the auth context
      } catch (error) {
        console.error('Error checking seller access:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      checkSellerAccess();
    } else {
      router.push('/login');
    }
  }, [router, isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (user?.role !== 'seller') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const navigation = [
    { name: 'Dashboard', href: '/seller/dashboard' },
    { name: 'Products', href: '/seller/products' },
    { name: 'Orders', href: '/seller/orders' },
    { name: 'Profile', href: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/seller/dashboard" className="text-xl font-bold text-sky-600">
                  Seller Portal
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      pathname === item.href
                        ? 'border-sky-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <Link
                href="/"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Back to Store
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
} 