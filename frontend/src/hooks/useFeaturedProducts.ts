import useSWR from 'swr';
import type { Product } from '@/src/types/product';

async function fetcher(url: string): Promise<Product[]> {
  const res = await fetch(url, { cache: 'no-store' });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      (data?.message as string) ?? 'Failed to fetch featured products'
    );
  }
  return Array.isArray(data) ? data : [];
}

const FEATURED_PRODUCTS_KEY = '/api/products/featured';

/**
 * Fetches featured products (first 6) from the cached API using SWR.
 * - First load: GET /api/products/featured (cache miss → backend → Redis → response).
 * - Subsequent: served from SWR cache; revalidates in background per SWR config.
 */
export function useFeaturedProducts() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<Product[]>(
    FEATURED_PRODUCTS_KEY,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60 * 1000,
    }
  );

  return {
    products: data ?? [],
    error,
    isLoading,
    isValidating,
    mutate,
  };
}
