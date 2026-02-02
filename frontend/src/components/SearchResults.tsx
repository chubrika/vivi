import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: {
    _id: string;
    name: string;
  };
}

interface SearchResultsProps {
  searchTerm: string;
  onClose: () => void;
}

export default function SearchResults({ searchTerm, onClose }: SearchResultsProps) {
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const searchProducts = async () => {
      if (!searchTerm.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/products/search?search=${encodeURIComponent(searchTerm)}&limit=5`);
        if (!response.ok) {
          throw new Error('Failed to fetch search results');
        }
        const data = await response.json();
        setResults(data.products);
      } catch (err) {
        setError('Error searching products');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleProductClick = (product: Product) => {
    const slug = product.productSlug || product._id;
    router.push(`/products/product/${slug}`);
    onClose();
  };

  if (!searchTerm.trim()) {
    return null;
  }

  return (
    <div 
      ref={resultsRef}
      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50"
    >
      {loading ? (
        <div className="p-4 text-center text-gray-500">
          Loading...
        </div>
      ) : error ? (
        <div className="p-4 text-center text-red-500">
          {error}
        </div>
      ) : results.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No products found
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {results.map((product) => (
            <div
              key={product._id}
              className="block p-4 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
              onClick={() => handleProductClick(product)}
            >
              <div className="flex items-center space-x-4">
                {product.images && product.images[0] && (
                  <div className="flex-shrink-0 w-16 h-16 relative">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {product.category?.name}
                  </p>
                  <p className="text-sm font-medium text-sky-600">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 