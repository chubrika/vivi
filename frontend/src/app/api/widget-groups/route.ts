import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4800';

export const dynamic = 'force-dynamic';

/**
 * Next.js API Route (App Router): GET /api/widget-groups
 *
 * Proxies to backend Express GET /api/widget-groups. Caching lives only on the backend
 * (Redis key "widget-groups:all"); this route does not cache so that when the backend
 * invalidates Redis after a write, the next request here hits the backend and gets fresh data.
 *
 * - next: { revalidate: 0 } — do not use Next.js fetch cache for the backend call.
 * - Cache-Control / Pragma — tell the browser not to cache this response (no disk cache).
 * - Error handling: forward backend status and message; 500 on network/server errors.
 */
export async function GET() {
  try {
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
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
      },
    });
  } catch (error) {
    console.error('[API /api/widget-groups] Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
