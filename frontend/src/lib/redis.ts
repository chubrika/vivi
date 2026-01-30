/**
 * Redis client singleton for Next.js API routes.
 * Reuses a single connection to avoid exhausting Redis connection limits.
 * Safe for serverless: connect on first use, no connection in edge runtime.
 */

// Use dynamic import so Redis is only loaded on the server
type RedisClient = import('ioredis').Redis;

const REDIS_URL = process.env.REDIS_URL;
// 24 hours in seconds
const CACHE_TTL_SECONDS = 24 * 60 * 60;

let client: RedisClient | null = null;
let clientPromise: Promise<RedisClient | null> | null = null;

/**
 * Get or create the Redis client (lazy connection).
 * Returns null if REDIS_URL is not set (e.g. local dev without Redis).
 */
export async function getRedisClient(): Promise<RedisClient | null> {
  if (!REDIS_URL) {
    return null;
  }

  if (client) {
    return client;
  }

  if (!clientPromise) {
    clientPromise = (async () => {
      try {
        const { default: Redis } = await import('ioredis');
        const redis = new Redis(REDIS_URL, {
          maxRetriesPerRequest: 3,
          retryStrategy(times) {
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
 * Cache TTL in seconds (24 hours).
 */
export const CATEGORIES_CACHE_TTL = CACHE_TTL_SECONDS;

/**
 * Cache key for the categories list.
 */
export const CATEGORIES_CACHE_KEY = 'categories:all';

/**
 * Cache TTL for home page data (same as categories, 24 hours).
 */
export const HOME_WIDGET_GROUPS_CACHE_TTL = CACHE_TTL_SECONDS;

/**
 * Cache key for home page widget groups.
 */
export const HOME_WIDGET_GROUPS_CACHE_KEY = 'home:widget-groups';

/**
 * Cache TTL for home sliders (24 hours).
 */
export const HOME_SLIDERS_CACHE_TTL = CACHE_TTL_SECONDS;

/**
 * Cache key for home sliders list.
 */
export const HOME_SLIDERS_CACHE_KEY = 'home:sliders';

/**
 * Cache TTL for featured products (home slider, 24 hours).
 */
export const PRODUCTS_FEATURED_CACHE_TTL = CACHE_TTL_SECONDS;

/**
 * Cache key for featured products list (first N for home).
 */
export const PRODUCTS_FEATURED_CACHE_KEY = 'products:featured';
