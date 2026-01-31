/**
 * Redis cache layer — backend only. Never exposed to the frontend.
 *
 * Caching flow (e.g. widget-groups):
 * 1. GET: Check key "widget-groups:all". Hit → return cached JSON. Miss → load from MongoDB,
 *    store in Redis with TTL 1h, return. We do NOT cache write responses.
 * 2. POST/PUT/DELETE (any write): Update MongoDB, then invalidate "widget-groups:all"
 *    so the next GET gets fresh data. Write responses are never cached.
 *
 * Security: REDIS_URL is server-side only; frontend talks to Next.js API route which
 * proxies to Express; Redis is never exposed to the client.
 */

import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL;

/** Cache key for the full widget groups list. Invalidate on any write (create/update/delete/reorder). */
export const WIDGET_GROUPS_CACHE_KEY = 'widget-groups:all';

/** TTL for widget groups cache: 1 hour (in seconds). */
export const WIDGET_GROUPS_CACHE_TTL_SECONDS = 60 * 60;

/** Cache key for categories list (tree). Invalidate on category create/update/delete. */
export const CATEGORIES_CACHE_KEY = 'categories:all';

/** TTL for categories cache: 1 hour. */
export const CATEGORIES_CACHE_TTL_SECONDS = 60 * 60;

/** Cache key for home sliders list. Invalidate on home slider create/update/delete. */
export const HOME_SLIDERS_CACHE_KEY = 'home-sliders:all';

/** TTL for home sliders cache: 1 hour. */
export const HOME_SLIDERS_CACHE_TTL_SECONDS = 60 * 60;

/** Cache key for featured products (first N). Invalidate on product create/update/delete. */
export const PRODUCTS_FEATURED_CACHE_KEY = 'products:featured';

/** TTL for featured products cache: 1 hour. */
export const PRODUCTS_FEATURED_CACHE_TTL_SECONDS = 60 * 60;

let client: Redis | null = null;
let clientPromise: Promise<Redis | null> | null = null;

/**
 * Get or create the Redis client (lazy connection).
 * Returns null if REDIS_URL is not set (e.g. local dev without Redis).
 */
export async function getRedisClient(): Promise<Redis | null> {
  if (!REDIS_URL) {
    return null;
  }

  if (client) {
    return client;
  }

  if (!clientPromise) {
    clientPromise = (async () => {
      try {
        const redis = new Redis(REDIS_URL, {
          maxRetriesPerRequest: 3,
          retryStrategy(times: number) {
            if (times > 3) return null;
            return Math.min(times * 200, 2000);
          },
          lazyConnect: true,
        });
        await redis.connect();
        client = redis;
        return redis;
      } catch (err) {
        console.error('[Redis] Connection failed:', err);
        clientPromise = null;
        return null;
      }
    })();
  }

  return clientPromise;
}

/**
 * Invalidate the widget groups cache. Call after ANY write: create, update, delete, reorder.
 * Next GET will be a cache miss and load fresh data from MongoDB.
 */
export async function invalidateWidgetGroupsCache(): Promise<void> {
  const redis = await getRedisClient();
  if (redis) await redis.del(WIDGET_GROUPS_CACHE_KEY);
}

/** Invalidate categories cache. Call after category create/update/delete. */
export async function invalidateCategoriesCache(): Promise<void> {
  const redis = await getRedisClient();
  if (redis) await redis.del(CATEGORIES_CACHE_KEY);
}

/** Invalidate home sliders cache. Call after home slider create/update/delete. */
export async function invalidateHomeSlidersCache(): Promise<void> {
  const redis = await getRedisClient();
  if (redis) await redis.del(HOME_SLIDERS_CACHE_KEY);
}

/** Invalidate featured products cache. Call after product create/update/delete. */
export async function invalidateFeaturedProductsCache(): Promise<void> {
  const redis = await getRedisClient();
  if (redis) await redis.del(PRODUCTS_FEATURED_CACHE_KEY);
}
