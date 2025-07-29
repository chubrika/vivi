'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../utils/authContext';
import { useCart } from '../utils/cartContext';
import { useCategoryMenu } from '../contexts/CategoryMenuContext';
import Image from 'next/image';
import SearchResults from './SearchResults';
import { Search, ShoppingCart, User, Menu, X, MessageCircle } from 'lucide-react';
import CategoryMenu from './CategoryMenu';
import { Category } from '../types/category';

export default function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, logout, user } = useAuth();
  const { totalItems } = useCart();
  const { isCategoryMenuOpen, toggleCategoryMenu, closeCategoryMenu } = useCategoryMenu();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const isSeller = user?.role === 'seller';
  const isCourier = user?.role === 'courier';
  const isCourierRoute = pathname?.includes('courier');

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        // Only get root categories (no parent)
        const rootCategories = data.filter((cat: Category) => !cat.parentId);
        setCategories(rootCategories);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  const navigationItems = [
    // { href: '/products', title: 'პროდუქტები' },
    { href: '/shops', title: 'მაღაზიები' },
    ...categories.map(category => ({
      href: `/products?category=${category.slug}`,
      title: category.name
    }))
  ];

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
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg z-50 border-b border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
      <div className="container mx-auto px-4">
        {/* Top row with logo, search, and user controls */}
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-4 md:gap-8">
            <Link href="/" className="flex items-center">
              <Image
                src="/img/logo.png"
                alt="Logo"
                width={80}
                height={80}
                className="mr-2 w-12 h-12 md:w-auto md:h-auto"
              />
            </Link>
            
            {/* Search Input */}
            <div className="flex-1 md:w-[400px] md:flex-none">
              <div className="relative" ref={searchRef}>
                <input
                  type="text"
                  placeholder="ძიება..."
                  className="w-full text-gray-500 px-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
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
          
          <div className="flex items-center gap-4 md:gap-6">
            {/* Chat Icon - Mobile Only */}
            <button
              onClick={openChat}
              className="md:hidden p-2 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
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
                    <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
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
              <div className="flex items-center gap-4 hidden md:flex">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium rounded-full text-purple-600 hover:bg-purple-50 transition duration-300"
                >
                  შესვლა
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Bottom row with navigation items */}
        <div className="hidden md:flex items-center h-10 border-t border-gray-100">
          <div className="flex gap-8">
            <button
              onClick={toggleCategoryMenu}
              className="inline-flex items-center px-1 text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              კატეგორიები
            </button>
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${
                  pathname === item.href
                    ? 'text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                } inline-flex items-center px-1 text-sm font-medium`}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'} bg-white border-t border-gray-100`}>
        <div className="px-4 py-3 space-y-2">
          <button
            onClick={toggleCategoryMenu}
            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300"
          >
            ყველა კატეგორია
          </button>
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${
                pathname === item.href
                  ? 'bg-purple-50 border-purple-500 text-purple-700'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            >
              {item.title}
            </Link>
          ))}
        </div>
      </div>

      <CategoryMenu 
        isOpen={isCategoryMenuOpen} 
        onClose={closeCategoryMenu} 
      />
    </nav>
  );
} 