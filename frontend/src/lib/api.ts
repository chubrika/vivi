/**
 * Centralized API for server-side data fetching (App Router, Server Components).
 * Use next.revalidate for ISR; avoid no-store unless required.
 */

import type { Product } from '@/src/types/product';
import type { Category } from '@/src/types/category';

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4800';

const defaultRevalidate = 3600; // 1 hour
const dailyRevalidate = 86400;

export type ProductsQuery = {
  category?: string;
  filter?: string;
  minPrice?: number;
  maxPrice?: number;
  [key: string]: string | number | undefined;
};

async function fetchApi<T>(
  path: string,
  options: RequestInit & { next?: { revalidate?: number } } = {}
): Promise<T> {
  const base = getBaseUrl();
  const url = path.startsWith('http') ? path : `${base}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || `API error: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// —— Products ——

export async function fetchProducts(
  query: ProductsQuery = {},
  revalidate = defaultRevalidate
): Promise<Product[]> {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== '') params.set(k, String(v));
  });
  const qs = params.toString();
  const path = qs ? `/api/products?${qs}` : '/api/products';
  const data = await fetchApi<Product[]>(path, {
    next: { revalidate },
  });
  return Array.isArray(data) ? data : [];
}

export async function fetchProductById(
  id: string,
  revalidate = defaultRevalidate
): Promise<Product | null> {
  try {
    return await fetchApi<Product>(`/api/products/${id}`, {
      next: { revalidate },
    });
  } catch {
    return null;
  }
}

// —— Categories ——

export async function fetchCategories(
  revalidate = defaultRevalidate
): Promise<Category[]> {
  try {
    const data = await fetchApi<Category[]>('/api/categories', {
      next: { revalidate },
    });
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function fetchCategoryBySlug(
  slug: string,
  revalidate = defaultRevalidate
): Promise<Category | null> {
  const categories = await fetchCategories(revalidate);
  const find = (list: Category[]): Category | null => {
    for (const c of list) {
      if (c.slug === slug) return c;
      if (c.children?.length) {
        const child = find(c.children);
        if (child) return child;
      }
    }
    return null;
  };
  return find(categories);
}

// —— Filters (for products page; optional auth for public filters) ——

export interface FilterPublic {
  _id: string;
  name: string;
  slug: string;
  type: string;
  config?: { options?: string[] };
}

export async function fetchFiltersForCategory(
  categorySlug: string | null,
  revalidate = defaultRevalidate
): Promise<FilterPublic[]> {
  const params = new URLSearchParams();
  params.set('isActive', 'true');
  if (categorySlug) params.set('category', categorySlug);
  try {
    const data = await fetchApi<FilterPublic[]>(
      `/api/filters?${params.toString()}`,
      { next: { revalidate } }
    );
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// —— Sellers / Shops (public) ——

export interface SellerPublic {
  _id: string;
  email: string;
  sellerProfile: {
    _id: string;
    storeName: string;
    phone?: string;
    status?: string;
    isActive?: boolean;
  };
}

export async function fetchSellersPublic(
  revalidate = defaultRevalidate
): Promise<SellerPublic[]> {
  try {
    const data = await fetchApi<SellerPublic[]>('/api/sellers/public', {
      next: { revalidate },
    });
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function fetchSellerPublicBySlug(
  slug: string,
  revalidate = defaultRevalidate
): Promise<SellerPublic | null> {
  try {
    return await fetchApi<SellerPublic>(`/api/sellers/public/${slug}`, {
      next: { revalidate },
    });
  } catch {
    return null;
  }
}

export async function fetchProductsBySeller(
  sellerId: string,
  revalidate = defaultRevalidate
): Promise<Product[]> {
  try {
    const data = await fetchApi<Product[]>(
      `/api/products/seller/${sellerId}/public`,
      { next: { revalidate } }
    );
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// —— Home (sliders, widget groups) ——

export async function fetchHomeSliders(
  revalidate = defaultRevalidate
): Promise<unknown[]> {
  try {
    const raw = await fetchApi<unknown[] | { data?: unknown[] }>(
      '/api/home-sliders',
      { next: { revalidate } }
    );
    const data = Array.isArray(raw) ? raw : (raw as { data?: unknown[] })?.data;
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function fetchWidgetGroups(
  revalidate = defaultRevalidate
): Promise<unknown[]> {
  try {
    const raw = await fetchApi<unknown[] | { success?: boolean; data?: unknown[] }>(
      '/api/widget-groups',
      { next: { revalidate } }
    );
    const data = Array.isArray(raw) ? raw : (raw as { data?: unknown[] })?.data;
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function fetchFeaturedProducts(
  revalidate = defaultRevalidate
): Promise<Product[]> {
  try {
    const data = await fetchApi<Product[]>('/api/products/featured', {
      next: { revalidate },
    });
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// For sitemap / static generation
export { getBaseUrl };
export const fetchAllProductsForSitemap = () =>
  fetchProducts({}, dailyRevalidate);
export const fetchAllCategoriesForSitemap = () =>
  fetchCategories(dailyRevalidate);
export const fetchAllSellersForSitemap = () =>
  fetchSellersPublic(dailyRevalidate);
