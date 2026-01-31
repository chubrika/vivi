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
  const res = await fetch(url, { cache: 'no-store' });
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

/** SWR key for widget groups. Use this with mutate() to revalidate after updates. */
export const WIDGET_GROUPS_KEY = '/api/widget-groups';

/**
 * useWidgetGroups — SWR hook for GET /api/widget-groups
 *
 * Returns: { widgetGroups, error, isLoading, isValidating, mutate }.
 * Data shape: { success, data: WidgetGroup[] } from API; hook exposes data as WidgetGroup[].
 *
 * Trigger revalidation after create/update/delete (e.g. in admin):
 *   import { mutate } from 'swr';
 *   import { WIDGET_GROUPS_KEY } from '@/hooks/useWidgetGroups';
 *   // After successful PUT/POST/DELETE:
 *   await mutate(WIDGET_GROUPS_KEY);
 *
 * Or use the mutate returned from the hook on a page that already uses useWidgetGroups:
 *   const { mutate } = useWidgetGroups();
 *   await saveGroup(...); then mutate();
 */
export function useWidgetGroups() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<WidgetGroup[]>(
    WIDGET_GROUPS_KEY,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5 * 1000,
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
