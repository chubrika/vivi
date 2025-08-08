'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import TestingBanner from './TestingBanner';

export default function NavbarWrapper() {
  const pathname = usePathname();
  
  // Hide Navbar on admin routes
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/seller')) {
    return null;
  }
  
  return (
    <>
      <TestingBanner />
      <Navbar />
    </>
  );
} 