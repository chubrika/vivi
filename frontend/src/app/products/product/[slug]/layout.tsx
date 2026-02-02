import { Metadata } from 'next';
import Script from 'next/script';
import {
  generateMetadata as generateSEOMetadata,
  generateProductStructuredData,
  generateBreadcrumbStructuredData,
} from '@/src/utils/seo';
import { fetchProductById } from '@/src/lib/api';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vivi.ge';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await fetchProductById(params.slug);

  if (!product) {
    return generateSEOMetadata({
      title: 'პროდუქტი ვერ მოიძებნა',
      description: 'პროდუქტი ვერ მოიძებნა',
    });
  }

  const productImage =
    product.images?.length > 0 ? product.images[0] : `${siteUrl}/img/logo.png`;
  const categoryName =
    typeof product.category === 'object' && product.category !== null
      ? product.category.name
      : '';
  const description = product.description
    ? product.description.replace(/<[^>]*>/g, '').substring(0, 160)
    : `${product.name} - იყიდე ${siteUrl}-ზე საუკეთესო ფასებით`;

  return generateSEOMetadata({
    title: product.name,
    description,
    image: productImage,
    url: `${siteUrl}/products/product/${params.slug}`,
    type: 'product',
    category: categoryName,
    price: product.discountedPrice || product.price,
    currency: 'GEL',
    availability: product.stock > 0 ? 'in stock' : 'out of stock',
  });
}

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const product = await fetchProductById(params.slug);

  let structuredData = null;
  let breadcrumbData = null;

  if (product) {
    const productImage =
      product.images?.length > 0 ? product.images[0] : `${siteUrl}/img/logo.png`;
    const categoryName =
      typeof product.category === 'object' && product.category !== null
        ? product.category.name
        : '';
    const categorySlug =
      typeof product.category === 'object' &&
      product.category !== null &&
      'slug' in product.category
        ? (product.category as { slug?: string }).slug
        : '';

    structuredData = generateProductStructuredData({
      name: product.name,
      description:
        product.description?.replace(/<[^>]*>/g, '') || product.name,
      image:
        product.images?.length > 0 ? product.images : [productImage],
      price: product.discountedPrice || product.price,
      currency: 'GEL',
      availability: product.stock > 0 ? 'in stock' : 'out of stock',
      brand: 'vivi.ge',
      category: categoryName,
      sku: product._id,
      url: `${siteUrl}/products/product/${params.slug}`,
    });

    breadcrumbData = generateBreadcrumbStructuredData([
      { name: 'მთავარი', url: siteUrl },
      { name: 'პროდუქტები', url: `${siteUrl}/products` },
      ...(categoryName
        ? [
            {
              name: categoryName,
              url: categorySlug
                ? `${siteUrl}/products/${categorySlug}`
                : `${siteUrl}/products`,
            },
          ]
        : []),
      {
        name: product.name,
        url: `${siteUrl}/products/product/${params.slug}`,
      },
    ]);
  }

  return (
    <>
      {structuredData && (
        <Script
          id="product-structured-data"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}
      {breadcrumbData && (
        <Script
          id="breadcrumb-structured-data"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbData),
          }}
        />
      )}
      {children}
    </>
  );
}
