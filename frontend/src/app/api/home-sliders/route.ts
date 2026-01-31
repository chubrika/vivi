import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4800';

/**
 * GET /api/home-sliders
 * Proxies to the backend. Caching and invalidation are handled by the backend
 * (Redis key "home-sliders:all", invalidated on home slider create/update/delete).
 */
export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/home-sliders`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      const text = await response.text();
      let message = 'Failed to fetch home sliders';
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
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API /api/home-sliders] Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = request.headers.get('authorization');

    const response = await fetch(`${API_BASE_URL}/api/home-sliders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: token }),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error creating home slider:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create home slider' },
      { status: 500 }
    );
  }
}
