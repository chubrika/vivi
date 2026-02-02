'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { SellerPublic } from '@/src/lib/api';

interface ShopsListClientProps {
  initialSellers: SellerPublic[];
}

const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
const numbers = ['0-9'];

export default function ShopsListClient({ initialSellers }: ShopsListClientProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filteredSellers = useMemo(() => {
    if (!activeFilter) return initialSellers;
    if (activeFilter === '0-9') {
      return initialSellers.filter((s) =>
        /^[0-9]/.test(s.sellerProfile?.storeName ?? '')
      );
    }
    return initialSellers.filter((s) =>
      (s.sellerProfile?.storeName ?? '').toUpperCase().startsWith(activeFilter)
    );
  }, [initialSellers, activeFilter]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">მაღაზიები</h1>

      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {numbers.map((num) => (
            <button
              key={num}
              onClick={() => setActiveFilter(activeFilter === num ? null : num)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                activeFilter === num
                  ? 'bg-sky-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {num}
            </button>
          ))}
          {alphabet.map((letter) => (
            <button
              key={letter}
              onClick={() => setActiveFilter(activeFilter === letter ? null : letter)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                activeFilter === letter
                  ? 'bg-sky-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {letter}
            </button>
          ))}
          {activeFilter && (
            <button
              onClick={() => setActiveFilter(null)}
              className="px-3 py-1 rounded-md text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              გასუფთავება
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredSellers.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            მაღაზიები ვერ მოიძებნა.
          </div>
        ) : (
          filteredSellers.map((seller) => (
            <div key={seller._id}>
              <Link
                href={`/shops/${seller._id}`}
                className="text-xl font-semibold text-sky-600 hover:text-sky-800 block mb-2"
              >
                {seller.sellerProfile?.storeName}
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
