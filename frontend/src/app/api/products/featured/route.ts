import { NextResponse } from 'next/server';
import {
  getRedisClient,
  PRODUCTS_FEATURED_CACHE_KEY,
  PRODUCTS_FEATURED_CACHE_TTL,
} from '@/src/lib/redis';

const BACKEND_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4800';

const FEATURED_LIMIT = 6;

/**
 * GET /api/products/featured
 * Returns first N products for the home slider. Uses Redis cache with 24h TTL;
 * on cache miss, fetches from the backend API, slices to N, stores in Redis.
 */
export async function GET() {
  try {
    const redis = await getRedisClient();
    if (redis) {
      const cached = await redis.get(PRODUCTS_FEATURED_CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached) as unknown;
        return NextResponse.json(data);
      }
    }

    const response = await fetch(`${BACKEND_URL}/api/products`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      const text = await response.text();
      let message = 'Failed to fetch products';
      try {
        const parsed = JSON.parse(text);
        message = parsed.message || message;
      } catch {
        message = text || message;
      }
      return NextResponse.json(
        { success: false, message },
        { status: response.status }
      );
    }

    const raw = await response.json();
    const list = Array.isArray(raw) ? raw : (raw?.data ?? []);
    const featured = list.slice(0, FEATURED_LIMIT);

    if (redis && Array.isArray(featured)) {
      await redis.setex(
        PRODUCTS_FEATURED_CACHE_KEY,
        PRODUCTS_FEATURED_CACHE_TTL,
        JSON.stringify(featured)
      );
    }

    return NextResponse.json(featured);
  } catch (error) {
    console.error('[API /api/products/featured] Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
