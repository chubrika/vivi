import useSWR from 'swr';
import type { Category } from '@/src/types/category';

/**
 * Fetcher for SWR: calls the Next.js API route that returns cached categories.
 * Uses relative URL so it hits the same origin (Next.js /api/categories).
 */
async function fetcher(url: string): Promise<Category[]> {
  const res = await fetch(url);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to fetch categories');
  }
  return res.json();
}

/** SWR key for the categories list (same as API path). */
const CATEGORIES_KEY = '/api/categories';

/**
 * React hook that fetches categories from the cached API using SWR.
 * - First load: GET /api/categories (cache miss → backend → Redis → response).
 * - Subsequent: served from SWR cache; revalidates in background per SWR config.
 *
 * @example
 * const { data: categories, error, isLoading, mutate } = useCategories();
 * if (isLoading) return <Spinner />;
 * if (error) return <div>{error.message}</div>;
 * return <CategoryMenu items={categories ?? []} />;
 */
export function useCategories() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<Category[]>(
    CATEGORIES_KEY,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60 * 1000, // 1 min — avoid refetch if key was requested recently
    }
  );

  return {
    categories: data ?? [],
    error,
    isLoading,
    isValidating,
    mutate,
  };
}
