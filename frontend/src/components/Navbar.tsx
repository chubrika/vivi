'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../utils/authContext';
import { useCart } from '../utils/cartContext';
import Image from 'next/image';
import SearchResults from './SearchResults';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, logout, user } = useAuth();
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const isSeller = user?.role === 'seller';
  const isCourier = user?.role === 'courier';
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

  const isActive = (path: string) => pathname === path;

  // If URL contains 'courier', don't render the navbar
  if (isCourierRoute) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg z-50 border-b border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
      <div className="container mx-auto px-4">
        {/* Top row with logo, search, and user controls */}
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center">
              <Image
                src="/img/logo.png"
                alt="Logo"
                width={80}
                height={80}
                className="mr-2"
              />
            </Link>
            
            {/* Search Input */}
            <div className="hidden md:block w-[400px]">
              <div className="relative" ref={searchRef}>
                <input
                  type="text"
                  placeholder="ძიება..."
                  className="w-full px-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
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
          
          <div className="flex items-center gap-6">
            {/* Cart Icon - Only show for non-sellers and non-couriers */}
            {!isSeller && !isCourier && (
              <Link href="/cart" className="relative">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition duration-300">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </div>
              </Link>
            )}
            
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center focus:outline-none"
                  aria-expanded={dropdownOpen}
                >
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white hover:bg-purple-700 transition duration-300">
                    <User className="h-5 w-5" />
                  </div>
                </button>
                
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-10 border border-gray-100">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition duration-300"
                      onClick={() => setDropdownOpen(false)}
                    >
                      My Account
                    </Link>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition duration-300"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium rounded-full text-purple-600 hover:bg-purple-50 transition duration-300"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium rounded-full text-white bg-purple-600 hover:bg-purple-700 transition duration-300"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-full text-gray-500 hover:bg-gray-100 transition duration-300"
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
        
        {/* Bottom row with navigation items */}
        <div className="hidden md:flex items-center h-12 border-t border-gray-100">
          <div className="flex gap-8">
            <Link
              href="/products"
              className={`inline-flex items-center px-2 py-1 text-sm font-medium transition duration-300 ${
                isActive('/products')
                  ? 'text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              პროდუქტები
            </Link>
            <Link
              href="/shops"
              className={`inline-flex items-center px-2 py-1 text-sm font-medium transition duration-300 ${
                isActive('/shops')
                  ? 'text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              მაღაზიები
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'} bg-white border-t border-gray-100`}>
        <div className="px-4 py-3 space-y-2">
          <Link
            href="/products"
            className={`block px-3 py-2 rounded-lg text-base font-medium transition duration-300 ${
              isActive('/products')
                ? 'bg-purple-50 text-purple-600'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            პროდუქტები
          </Link>
          <Link
            href="/shops"
            className={`block px-3 py-2 rounded-lg text-base font-medium transition duration-300 ${
              isActive('/shops')
                ? 'bg-purple-50 text-purple-600'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            მაღაზიები
          </Link>
        </div>
      </div>
    </nav>
  );
} 