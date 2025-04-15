'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../utils/authContext';
import { useCart } from '../utils/cartContext';
import Image from 'next/image';

export default function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <nav className="bg-white shadow-lg ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="/img/logo.png"
                  alt="Logo"
                  width={80}
                  height={80}
                  className="mr-2"
                />
                {/* <span className="text-xl font-bold text-primary">vivi.ge</span> */}
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/products"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/products')
                    ? 'border-purple-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                პროდუქტები
              </Link>
              <Link
                href="/sellers"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/sellers')
                    ? 'border-purple-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                მაღაზიები
              </Link>
              <Link
                href="/contact"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/contact')
                    ? 'border-purple-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                კონტაქტი
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Cart Icon */}
            <Link href="/cart" className="relative">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </div>
            </Link>
            
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center focus:outline-none"
                  aria-expanded={dropdownOpen}
                >
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </button>
                
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                      onClick={() => setDropdownOpen(false)}
                    >
                      My Account
                    </Link>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-x-4">
                <Link
                  href="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-purple-600 bg-white hover:bg-gray-50"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`sm:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`} id="mobile-menu">
        <div className="pt-2 pb-3 space-y-1">
          <Link
            href="/products"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              isActive('/products')
                ? 'bg-purple-50 border-purple-500 text-purple-700'
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            პროდუქტები
          </Link>
          <Link
            href="/sellers"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              isActive('/sellers')
                ? 'bg-purple-50 border-purple-500 text-purple-700'
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            მაღაზიები
          </Link>
          <Link
            href="/contact"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              isActive('/contact')
                ? 'bg-purple-50 border-purple-500 text-purple-700'
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            კონტაქტი
          </Link>
        </div>
      </div>
    </nav>
  );
} 