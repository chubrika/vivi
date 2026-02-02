import { Metadata } from 'next';
import Script from 'next/script';
import { generateBreadcrumbStructuredData } from '@/src/utils/seo';
import { fetchSellerPublicBySlug } from '@/src/lib/api';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vivi.ge';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const seller = await fetchSellerPublicBySlug(params.slug);

  if (!seller) {
    return {
      title: 'მაღაზია ვერ მოიძებნა',
      description: 'მაღაზია ვერ მოიძებნა',
      robots: { index: false, follow: false },
    };
  }

  const sellerName = seller.sellerProfile?.storeName || 'მაღაზია';
  const description = `${sellerName} - გაეცანით პროდუქტებს ${sellerName}-დან vivi.ge-ზე. ხარისხიანი პროდუქტები და საიმედო მომსახურება.`;

  return {
    title: `${sellerName} - vivi.ge`,
    description,
    robots: {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    },
  };
}

export default async function ShopLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const seller = await fetchSellerPublicBySlug(params.slug);

  let breadcrumbData = null;

  if (seller) {
    const sellerName = seller.sellerProfile?.storeName || 'მაღაზია';

    breadcrumbData = generateBreadcrumbStructuredData([
      { name: 'მთავარი', url: siteUrl },
      { name: 'მაღაზიები', url: `${siteUrl}/shops` },
      { name: sellerName, url: `${siteUrl}/shops/${params.slug}` },
    ]);
  }

  return (
    <>
      {breadcrumbData && (
        <Script
          id="shop-breadcrumb-structured-data"
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
