'use client';

import { usePathname } from 'next/navigation';

interface MainContentProps {
  children: React.ReactNode;
}

export default function MainContent({ children }: MainContentProps) {
  const pathname = usePathname();
  
  // Check if current path is admin or courier panel
  const isAdminOrCourierPanel = pathname?.startsWith('/admin') || pathname?.startsWith('/courier');
  
  // Apply margin only for non-admin/non-courier pages
  const mainClasses = isAdminOrCourierPanel 
    ? "flex-grow pb-16 md:pb-0"
    : "flex-grow mt-[85px] md:mt-[140px] pb-16 md:pb-0 container mx-auto px-0 md:px-4";

  return (
    <main className={mainClasses}>
      {children}
    </main>
  );
} 