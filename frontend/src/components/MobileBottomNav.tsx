'use client';

import Link from 'next/link';
import { Home, ShoppingCart, User, Package, DollarSign, List } from 'lucide-react';
import { useAuth } from '../utils/authContext';
import { useCart } from '../utils/cartContext';
import { useCategoryMenu } from '../contexts/CategoryMenuContext';
import { useLoginSidebar } from '../contexts/LoginSidebarContext';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const MobileBottomNav = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const { totalItems } = useCart();
  const { toggleCategoryMenu } = useCategoryMenu();
  const { openLoginSidebar } = useLoginSidebar();
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Check if we're in courier portal
  const isInCourierPortal = pathname?.startsWith('/courier');

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

  // Don't render anything if we're in courier portal
  if (isInCourierPortal) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around py-2">
        <Link href="/" className="flex flex-col items-center p-2 text-gray-600 hover:text-sky-600 transition-colors">
          <Home className="w-5 h-5" />
          <span className="text-xs mt-1">მთავარი</span>
        </Link>
        
        <button
          onClick={toggleCategoryMenu}
          className="flex flex-col items-center p-2 text-gray-600 hover:text-sky-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span className="text-xs mt-1">კატეგორიები</span>
        </button>
        
        <Link href="/cart" className="flex flex-col items-center p-2 text-gray-600 hover:text-sky-600 transition-colors relative">
          <ShoppingCart className="w-5 h-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-sky-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
          <span className="text-xs mt-1">კალათა</span>
        </Link>
        
        <div className="relative" ref={dropdownRef}>
          {isAuthenticated ? (
            <>
              <button
                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                className="flex flex-col items-center p-2 text-gray-600 hover:text-sky-600 transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="text-xs mt-1">ანგარიში</span>
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
                    href="/profile?section=orders"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition duration-300"
                    onClick={() => setAccountDropdownOpen(false)}
                  >
                    <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    ჩემი შეკვეთები
                  </Link>
                  <Link
                    href="/profile?section=addresses"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition duration-300"
                    onClick={() => setAccountDropdownOpen(false)}
                  >
                    <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    მისამართები
                  </Link>
                  <Link
                    href="/profile?section=cards"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition duration-300"
                    onClick={() => setAccountDropdownOpen(false)}
                  >
                    <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    ჩემი ბარათები
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
            </>
          ) : (
            <button 
              onClick={openLoginSidebar}
              className="flex flex-col items-center p-2 text-gray-600 hover:text-sky-600 transition-colors"
            >
              <User className="w-5 h-5" />
              <span className="text-xs mt-1">შესვლა</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileBottomNav;