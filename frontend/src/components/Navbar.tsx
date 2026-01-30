'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useAuth, hasRole } from '../utils/authContext';
import { useCart } from '../utils/cartContext';
import { useCategoryMenu } from '../contexts/CategoryMenuContext';
import { useLoginSidebar } from '../contexts/LoginSidebarContext';
import Image from 'next/image';
import SearchResults from './SearchResults';
import { Search, ShoppingCart, User, Menu, X, MessageCircle, ChevronDown, ChevronUp, SquareMenu } from 'lucide-react';
import CategoryMenu from './CategoryMenu';
import { CategoriesIcon } from './icons/CategoriesIcon';

export default function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, logout, user } = useAuth();
  const { totalItems } = useCart();
  const { isCategoryMenuOpen, toggleCategoryMenu, closeCategoryMenu } = useCategoryMenu();
  const { openLoginSidebar } = useLoginSidebar();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const isSeller = hasRole(user, 'seller');
  const isCourier = hasRole(user, 'courier');
  const isCourierRoute = pathname?.includes('courier');

  // Check authentication status on component mount and when pathname changes
  useEffect(() => {
    // Add event listener for storage changes to detect login/logout from other tabs
    const handleStorageChange = () => {
      // The useAuth hook will automatically update when localStorage changes
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowSearchResults(true);
  };

  // Close search results
  const handleCloseSearchResults = () => {
    setShowSearchResults(false);
  };

  const handleLogout = () => {
    logout();
    // Redirect to home page
    window.location.href = '/';
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Function to open Tawk.to chat
  const openChat = () => {
    if (typeof window !== 'undefined' && (window as any).Tawk_API) {
      (window as any).Tawk_API.maximize();
    }
  };

  const isActive = (path: string) => pathname === path;

  // If URL contains 'courier', don't render the navbar
  if (isCourierRoute) {
    return null;
  }

  return (
    <nav className="fixed left-0 right-0 bg-white backdrop-blur-lg z-40 border-b border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
      <div className="container mx-auto px-4">
        {/* Top row with logo, search, and user controls */}
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center w-full">
            <Link href="/" className="flex items-center">
              <Image
                src="/img/logo.png"
                alt="Logo"
                width={40}
                height={40}
                className="w-8 h-8 md:w-auto md:h-auto mr-2"
              />
            </Link>
            <div className="flex gap-8">
            <button
              onClick={toggleCategoryMenu}
              className="hidden md:inline-flex items-center px-1 text-sm font-medium text-gray-900 hover:text-blue-900 focus:outline-none"
            >
              <CategoriesIcon 
                size={20}
                className="mr-2 text-current"
              />
              <span>კატეგორიები</span>
              {isCategoryMenuOpen ? (
                <ChevronUp className="h-4 w-4 ml-1" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-1" />
              )}
            </button>
          </div>
            {/* Search Input */}
            <div className="flex-1 md:w-[400px] md:flex-none">
              <div className="relative" ref={searchRef}>
                <input
                  type="text"
                  placeholder="ძიება..."
                  className="w-full text-gray-500 px-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-gray-50"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                
                {/* Search Results Dropdown */}
                {showSearchResults && (
                  <SearchResults 
                    searchTerm={searchTerm} 
                    onClose={handleCloseSearchResults} 
                  />
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center ml-2 gap-2 md:gap-6">
            {/* Chat Icon - Mobile Only */}
            <button
              onClick={openChat}
              className="md:hidden p-2 rounded-full bg-sky-100 text-sky-600 hover:bg-sky-200 transition-colors"
              title="Chat with us"
            >
              <MessageCircle className="h-5 w-5" />
            </button>

            {/* Cart Icon - Only show for non-sellers and non-couriers on desktop */}
            {!isSeller && !isCourier && (
              <Link href="/cart" className="relative hidden md:block">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition duration-300">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-sky-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </div>
              </Link>
            )}
            
            {isAuthenticated ? (
              <div className="relative hidden md:block" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center focus:outline-none"
                  aria-expanded={dropdownOpen}
                >
                  <div className="w-10 h-10 rounded-full bg-sky-600 flex items-center justify-center text-white hover:bg-sky-700 transition duration-300">
                    <User className="h-5 w-5" />
                  </div>
                </button>
                
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-10 border border-gray-100">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition duration-300"
                      onClick={() => setDropdownOpen(false)}
                    >
                      პროფილი
                    </Link>
                    <Link
                      href="/profile?section=orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition duration-300"
                      onClick={() => setDropdownOpen(false)}
                    >
                      შეკვეთები
                    </Link>
                    <Link
                      href="/profile?section=addresses"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition duration-300"
                      onClick={() => setDropdownOpen(false)}
                    >
                      მისამართები
                    </Link>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition duration-300"
                    >
                      გასვლა
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4 hidden md:flex">
                <button
                  onClick={openLoginSidebar}
                  className="px-4 py-2 text-sm font-medium rounded-full text-sky-600 hover:bg-sky-50 transition duration-300"
                >
                  შესვლა
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Bottom row with navigation items */}
        <div className="hidden md:flex items-center justify-between h-[50px] border-t border-gray-100">
          <div className="flex gap-4 md:gap-8">
            <a href="tel:+995123456789" className="flex items-center gap-2 text-gray-900 hover:text-blue-900 transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-sm font-medium text-gray-900 hover:text-blue-900 transition-colors">+995 123 456 789</span>
            </a>
          </div>
       
          <div className="flex gap-4 md:gap-8">
            <Link href="/shops" className="text-sm font-medium text-gray-900 hover:text-blue-900">მაღაზიები</Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'} bg-white border-t border-gray-100`}>
        <div className="px-4 py-3 space-y-2">
                                          <button
              onClick={toggleCategoryMenu}
              className="flex items-center justify-between w-full pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300"
            >
              <div className="flex items-center">
                <CategoriesIcon 
                  size={18}
                  className="mr-2 text-current"
                />
                <span>ყველა კატეგორია</span>
              </div>
              {isCategoryMenuOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
        </div>
      </div>

      <CategoryMenu 
        isOpen={isCategoryMenuOpen} 
        onClose={closeCategoryMenu} 
      />
    </nav>
  );
} 