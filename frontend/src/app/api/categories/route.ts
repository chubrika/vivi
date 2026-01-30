import { NextResponse } from 'next/server';
import { getRedisClient, CATEGORIES_CACHE_KEY, CATEGORIES_CACHE_TTL } from '@/src/lib/redis';

// Server-side backend URL (use API_URL in production so it's not exposed to the client)
const BACKEND_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4800';

/**
 * GET /api/categories
 * Returns all categories. Uses Redis cache with 24h TTL; on cache miss,
 * fetches from the database (via backend API) and stores in Redis.
 * Use the useCategories() SWR hook in the frontend to consume this endpoint.
 */
export async function GET() {
  try {
    // Step 1: Try to get categories from Redis cache (avoids DB hit when cached)
    const redis = await getRedisClient();
    if (redis) {
      const cached = await redis.get(CATEGORIES_CACHE_KEY);
      if (cached) {
        const categories = JSON.parse(cached) as unknown;
        return NextResponse.json(categories);
      }
    }

    // Step 2: Cache miss or Redis unavailable — fetch from database via backend API
    const response = await fetch(`${BACKEND_URL}/api/categories`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      const text = await response.text();
      let message = 'Failed to fetch categories';
      try {
        const data = JSON.parse(text);
        message = data.message || message;
      } catch {
        message = text || message;
      }
      return NextResponse.json(
        { success: false, message },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Step 3: Store result in Redis with 24-hour TTL for future requests
    if (redis && Array.isArray(data)) {
      await redis.setex(
        CATEGORIES_CACHE_KEY,
        CATEGORIES_CACHE_TTL,
        JSON.stringify(data)
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[API /api/categories] Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
