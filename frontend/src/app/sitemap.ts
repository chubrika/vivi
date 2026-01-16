import { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vivi.ge';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4800';

async function getProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      next: { revalidate: 86400 }, // Revalidate daily
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
    return [];
  }
}

async function getCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories`, {
      next: { revalidate: 86400 }, // Revalidate daily
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/shops`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  const productRoutes: MetadataRoute.Sitemap = products
    .filter((product: any) => product.isActive && product.stock > 0)
    .map((product: any) => ({
      url: `${siteUrl}/products/${product._id}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(product.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  const categoryRoutes: MetadataRoute.Sitemap = categories
    .filter((category: any) => category.slug)
    .map((category: any) => ({
      url: `${siteUrl}/products?category=${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}

