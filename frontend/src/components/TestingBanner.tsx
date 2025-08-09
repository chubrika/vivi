'use client';

import { AlertTriangle } from 'lucide-react';

export default function TestingBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-500 text-amber-900 px-4 py-3 text-center font-medium shadow-sm z-50">
      <div className="container mx-auto flex items-center justify-center gap-2">
        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
        <span className="text-sm md:text-base text-gray-900">
          საიტი ტესტირების რეჟიმშია !
        </span>
      </div>
    </div>
  );
} 