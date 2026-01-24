'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth, hasRole } from '../../utils/authContext';
import { API_BASE_URL } from '../../utils/api';
import { sellerProfileService } from '../../services/sellerProfileService';

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasSellerProfile, setHasSellerProfile] = useState(false);
  const [sellerStatus, setSellerStatus] = useState<string | null>(null);

  useEffect(() => {
    const checkSellerAccess = async () => {
      try {
        // Check if user has seller profile (even if pending)
        const profile = await sellerProfileService.getMyProfile();
        setHasSellerProfile(true);
        setSellerStatus(profile.status);
        
        // For profile page, allow access regardless of status
        // For other pages, only allow if approved
        if (pathname !== '/seller/profile' && profile.status !== 'approved') {
          router.push('/seller/profile');
          return;
        }
      } catch (error) {
        console.error('Error checking seller access:', error);
        // Check if they have seller role as fallback
        const hasSellerRole = hasRole(user, 'seller');
        if (!hasSellerRole) {
          router.push('/');
          return;
        }
        setHasSellerProfile(true);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      checkSellerAccess();
    } else {
      router.push('/login');
    }
  }, [router, isAuthenticated, user, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  // Allow access if user has seller role OR seller profile
  const hasSellerRole = hasRole(user, 'seller');
  if (!hasSellerRole && !hasSellerProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Navigation items - only show approved seller pages if approved
  const navigation = sellerStatus === 'approved' 
    ? [
        { name: 'Dashboard', href: '/seller/dashboard' },
        { name: 'Products', href: '/seller/products' },
        { name: 'Orders', href: '/seller/orders' },
        { name: 'Profile', href: '/seller/profile' },
      ]
    : [
        { name: 'Profile', href: '/seller/profile' },
      ];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link 
                  href={sellerStatus === 'approved' ? '/seller/dashboard' : '/seller/profile'} 
                  className="text-xl font-bold text-sky-600"
                >
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

      {sellerStatus && sellerStatus !== 'approved' && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-yellow-800">
                {sellerStatus === 'pending' 
                  ? 'თქვენი გამყიდველის პროფილი მოლოდინშია. გთხოვთ დაელოდოთ ადმინისტრაციის დამტკიცებას.'
                  : sellerStatus === 'rejected'
                  ? 'თქვენი გამყიდველის პროფილი უარყოფილია. გთხოვთ დაუკავშირდეთ ადმინისტრაციას.'
                  : 'თქვენი გამყიდველის პროფილი დაბლოკილია. გთხოვთ დაუკავშირდეთ ადმინისტრაციას.'}
              </p>
            </div>
          </div>
        </div>
      )}

      <main>{children}</main>
    </div>
  );
} 