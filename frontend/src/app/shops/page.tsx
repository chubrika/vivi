'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Seller {
    _id: string;
    email: string;
    sellerProfile: {
        _id: string;
        storeName: string;
        phone: string;
        isActive: boolean;
    }
}

export default function SellersPage() {
    const [sellers, setSellers] = useState<Seller[]>([]);
    const [filteredSellers, setFilteredSellers] = useState<Seller[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    // Generate alphabet array for filtering
    const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    const numbers = ['0-9'];

    useEffect(() => {
        const fetchSellers = async () => {
            try {
                const response = await fetch('/api/sellers/public');
                
                if (!response.ok) {
                    throw new Error('Failed to fetch sellers');
                }
                
                const data = await response.json();
                setSellers(data);
                setFilteredSellers(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchSellers();
    }, []);

    const handleFilterClick = (filter: string) => {
        setActiveFilter(filter);

        if (filter === '0-9') {
            // Filter sellers whose names start with a number
            const filtered = sellers.filter(seller => /^[0-9]/.test(seller.sellerProfile.storeName));
            setFilteredSellers(filtered);
        } else {
            // Filter sellers whose names start with the selected letter
            const filtered = sellers.filter(seller =>
                seller.sellerProfile.storeName.toUpperCase().startsWith(filter)
            );
            setFilteredSellers(filtered);
        }
    };

    const clearFilter = () => {
        setActiveFilter(null);
        setFilteredSellers(sellers);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Our Sellers</h1>

            {/* Alphabet Filter */}
            <div className="mb-8">
                <div className="flex flex-wrap gap-2">
                    {numbers.map((num) => (
                        <button
                            key={num}
                            onClick={() => handleFilterClick(num)}
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
                            onClick={() => handleFilterClick(letter)}
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
                            onClick={clearFilter}
                            className="px-3 py-1 rounded-md text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
                        >
                            Clear Filter
                        </button>
                    )}
                </div>
            </div>

            {/* Sellers Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredSellers.length === 0 ? (
                    <div className="col-span-full text-center text-gray-500 py-8">
                        No sellers found matching your filter.
                    </div>
                ) : (
                    filteredSellers.map((seller) => (
                        <div key={seller._id}>
                            <div className="mb-4">
                                <Link
                                    href={`/shops/${seller._id}`}
                                    className="text-xl font-semibold text-sky-600 hover:text-sky-800 block mb-2"
                                >
                                    {seller.sellerProfile.storeName}
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
} 