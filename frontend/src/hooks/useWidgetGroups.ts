import useSWR from 'swr';

export interface WidgetGroupCategory {
  categoryId: string;
  name: string;
  image: string;
  mobileImage: string;
  slug: string;
}

export interface WidgetGroup {
  _id: string;
  groupNumber: number;
  widgetName: string;
  categories: WidgetGroupCategory[];
}

interface WidgetGroupsApiResponse {
  success: boolean;
  data?: WidgetGroup[];
}

async function fetcher(url: string): Promise<WidgetGroup[]> {
  const res = await fetch(url);
  const data: WidgetGroupsApiResponse = await res.json();
  if (!res.ok) {
    throw new Error(
      (data as { message?: string }).message ?? 'Failed to fetch widget groups'
    );
  }
  if (!data.success || !Array.isArray(data.data)) {
    return [];
  }
  return data.data;
}

const WIDGET_GROUPS_KEY = '/api/widget-groups';

/**
 * Fetches widget groups from the cached API using SWR.
 * - First load: GET /api/widget-groups (cache miss → backend → Redis → response).
 * - Subsequent: served from SWR cache; revalidates in background per SWR config.
 */
export function useWidgetGroups() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<WidgetGroup[]>(
    WIDGET_GROUPS_KEY,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60 * 1000,
    }
  );

  return {
    widgetGroups: data ?? [],
    error,
    isLoading,
    isValidating,
    mutate,
  };
}
