import { NextResponse } from 'next/server';
import {
  getRedisClient,
  HOME_WIDGET_GROUPS_CACHE_KEY,
  HOME_WIDGET_GROUPS_CACHE_TTL,
} from '@/src/lib/redis';

const BACKEND_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4800';

/**
 * GET /api/widget-groups
 * Returns widget groups for the home page. Uses Redis cache with 24h TTL;
 * on cache miss, fetches from the backend API and stores in Redis.
 */
export async function GET() {
  try {
    const redis = await getRedisClient();
    if (redis) {
      const cached = await redis.get(HOME_WIDGET_GROUPS_CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached) as unknown;
        return NextResponse.json(data);
      }
    }

    const response = await fetch(`${BACKEND_URL}/api/widget-groups`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      const text = await response.text();
      let message = 'Failed to fetch widget groups';
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

    const data = await response.json();

    if (redis && data && typeof data === 'object') {
      await redis.setex(
        HOME_WIDGET_GROUPS_CACHE_KEY,
        HOME_WIDGET_GROUPS_CACHE_TTL,
        JSON.stringify(data)
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[API /api/widget-groups] Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
