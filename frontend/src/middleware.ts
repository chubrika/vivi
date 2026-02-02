import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Redirect old query-based product URLs to SEO-friendly routes.
 * - /products?category=slug → /products/slug
 * - /products?product=id → /products/product/id
 */
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname !== '/products') {
    return NextResponse.next();
  }

  const productId = searchParams.get('product');
  const categorySlug = searchParams.get('category');

  if (productId) {
    const url = request.nextUrl.clone();
    url.pathname = `/products/product/${productId}`;
    url.search = '';
    return NextResponse.redirect(url, 308);
  }

  if (categorySlug) {
    const url = request.nextUrl.clone();
    url.pathname = `/products/${categorySlug}`;
    url.search = '';
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/products',
};
