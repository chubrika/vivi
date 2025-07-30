'use client';

import Link from 'next/link';
import { Home, Package, DollarSign, User } from 'lucide-react';
import { useAuth } from '../utils/authContext';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

const CourierMobileBottomNav = () => {
  const { logout, user } = useAuth();
  const pathname = usePathname();
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAccountDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setAccountDropdownOpen(false);
    window.location.href = '/';
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around py-2">
        <Link 
          href="/courier/dashboard" 
          className={`flex flex-col items-center p-2 transition-colors ${
            pathname === '/courier/dashboard' 
              ? 'text-sky-600' 
              : 'text-gray-600 hover:text-sky-600'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs mt-1">დეშბორდი</span>
        </Link>
        
        <Link 
          href="/courier/orders" 
          className={`flex flex-col items-center p-2 transition-colors ${
            pathname === '/courier/orders' 
              ? 'text-sky-600' 
              : 'text-gray-600 hover:text-sky-600'
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="text-xs mt-1">შეკვეთები</span>
        </Link>
        
        <Link 
          href="/courier/earnings" 
          className={`flex flex-col items-center p-2 transition-colors ${
            pathname === '/courier/earnings' 
              ? 'text-sky-600' 
              : 'text-gray-600 hover:text-sky-600'
          }`}
        >
          <DollarSign className="w-5 h-5" />
          <span className="text-xs mt-1">შემოსავალი</span>
        </Link>
        
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
            className="flex flex-col items-center p-2 text-gray-600 hover:text-sky-600 transition-colors"
          >
            <User className="w-5 h-5" />
            <span className="text-xs mt-1">პროფილი</span>
          </button>
          
          {accountDropdownOpen && (
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-xl shadow-lg py-2 z-10 border border-gray-100">
              <Link
                href="/profile?section=personal"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition duration-300"
                onClick={() => setAccountDropdownOpen(false)}
              >
                <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                პირადი ინფორმაცია
              </Link>
              <Link
                href="/"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition duration-300"
                onClick={() => setAccountDropdownOpen(false)}
              >
                <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                მაღაზიაში დაბრუნება
              </Link>
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={handleLogout}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition duration-300"
              >
                <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                გასვლა
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourierMobileBottomNav; 