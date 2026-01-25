import { Metadata } from 'next';
import Script from 'next/script';
import { generateMetadata as generateSEOMetadata, generateBreadcrumbStructuredData } from '../../../utils/seo';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vivi.ge';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4800';

async function getSeller(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/sellers/public/${id}`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching seller:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const seller = await getSeller(params.id);
  
  if (!seller) {
    return generateSEOMetadata({
      title: 'მაღაზია ვერ მოიძებნა',
      description: 'მაღაზია ვერ მოიძებნა',
    });
  }

  const sellerName = seller.storeName || `მაღაზიებიდან`;
  const description = `${sellerName} - გაეცანით პროდუქტებს ${sellerName}-დან vivi.ge-ზე. ხარისხიანი პროდუქტები და საიმედო მომსახურება.`;

  return generateSEOMetadata({
    title: `${sellerName} - vivi.ge`,
    description,
    url: `${siteUrl}/shops/${params.id}`,
    type: 'website',
  });
}

export default async function ShopLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const seller = await getSeller(params.id);
  
  let breadcrumbData = null;

  if (seller) {
    const sellerName = seller.storeName || `მაღაზიებიდან`;
    
    breadcrumbData = generateBreadcrumbStructuredData([
      { name: 'მთავარი', url: siteUrl },
      { name: 'მაღაზიები', url: `${siteUrl}/shops` },
      { name: sellerName, url: `${siteUrl}/shops/${params.id}` },
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

