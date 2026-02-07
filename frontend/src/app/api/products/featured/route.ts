import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4800';

export const dynamic = 'force-dynamic';

/**
 * GET /api/products/featured
 * Proxies to the backend GET /api/products/featured. Caching and invalidation
 * are handled by the backend (Redis key "products:featured", invalidated on
 * product create/update/delete). This route does not cache so the next request
 * hits the backend and gets fresh data.
 */
export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/products/featured`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      const text = await response.text();
      let message = 'Failed to fetch featured products';
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
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
      },
    });
  } catch (error) {
    console.error('[API /api/products/featured] Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
