import useSWR from 'swr';

export interface HomeSlider {
  _id: string;
  name: string;
  slug: string;
  desktopImage: string;
  mobileImage: string;
  categorySlug: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface HomeSlidersApiResponse {
  success?: boolean;
  data?: HomeSlider[];
}

async function fetcher(url: string): Promise<HomeSlider[]> {
  const res = await fetch(url, { cache: 'no-store' });
  const data: HomeSlidersApiResponse = await res.json();
  if (!res.ok) {
    throw new Error(
      (data as { message?: string }).message ?? 'Failed to fetch home sliders'
    );
  }
  const raw = Array.isArray(data) ? data : data.data;
  if (!Array.isArray(raw)) return [];
  // Filter active and sort by order (same as HomeSlider component did)
  return raw
    .filter((s) => s.isActive)
    .sort((a, b) => a.order - b.order);
}

const HOME_SLIDERS_KEY = '/api/home-sliders';

/**
 * Fetches home sliders from the cached API using SWR.
 * Returns only active sliders sorted by order.
 * - First load: GET /api/home-sliders (cache miss → backend → Redis → response).
 * - Subsequent: served from SWR cache; revalidates in background per SWR config.
 */
export function useHomeSliders() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<HomeSlider[]>(
    HOME_SLIDERS_KEY,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60 * 1000,
    }
  );

  return {
    sliders: data ?? [],
    error,
    isLoading,
    isValidating,
    mutate,
  };
}
