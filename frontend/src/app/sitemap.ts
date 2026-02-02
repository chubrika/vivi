import { MetadataRoute } from 'next';
import {
  fetchAllProductsForSitemap,
  fetchAllCategoriesForSitemap,
} from '@/src/lib/api';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vivi.ge';

/**
 * Sitemap includes only SEO-indexable pages:
 * - Home (/)
 * - Category pages (/products/[category])
 * - Product detail pages (/products/product/[slug])
 * Cart, Checkout, Shops, Profile, and /products (list) are NOINDEX and excluded.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    fetchAllProductsForSitemap(),
    fetchAllCategoriesForSitemap(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  const productRoutes: MetadataRoute.Sitemap = products
    .filter((p: { isActive?: boolean; stock?: number }) => p.isActive && (p.stock ?? 0) > 0)
    .map((product: { _id: string; updatedAt?: string; createdAt?: string }) => ({
      url: `${siteUrl}/products/product/${product._id}`,
      lastModified: product.updatedAt
        ? new Date(product.updatedAt)
        : product.createdAt
          ? new Date(product.createdAt)
          : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  const categoryRoutes: MetadataRoute.Sitemap = categories
    .filter((c: { slug?: string }) => c.slug)
    .map((category: { slug: string }) => ({
      url: `${siteUrl}/products/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
