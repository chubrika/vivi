import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vivi.ge';
const siteName = 'vivi.ge';
const defaultDescription = 'vivi.ge - თქვენი ონლაინ მაღაზია. იპოვეთ ყველაზე კარგი პროდუქტები საუკეთესო ფასებით. სწრაფი მიტანა და უსაფრთხო გადახდები.';
const defaultImage = `${siteUrl}/img/logo.png`;

export interface SEOConfig {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  category?: string;
  price?: number;
  currency?: string;
  availability?: 'in stock' | 'out of stock' | 'preorder';
}

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description = defaultDescription,
    image = defaultImage,
    url,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
    category,
    price,
    currency = 'GEL',
    availability,
  } = config;

  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const canonicalUrl = url || siteUrl;

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: [
      'vivi.ge',
      'ონლაინ მაღაზია',
      'ინტერნეტ მაღაზია საქართველო',
      'პროდუქტები',
      'შოპინგი',
      'მიტანა',
      'კურიერი',
      'გადახდა',
      category,
    ].filter(Boolean).join(', '),
    authors: [{ name: author || siteName }],
    creator: siteName,
    publisher: siteName,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: type === 'product' ? 'website' : type,
      url: canonicalUrl,
      title: fullTitle,
      description,
      siteName,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title || siteName,
        },
      ],
      locale: 'ka_GE',
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
      creator: '@vivige',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    },
  };

  return metadata;
}

export function generateProductStructuredData(product: {
  name: string;
  description: string;
  image: string | string[];
  price: number;
  currency?: string;
  availability?: 'in stock' | 'out of stock' | 'preorder';
  brand?: string;
  category?: string;
  sku?: string;
  url: string;
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}) {
  const images = Array.isArray(product.image) ? product.image : [product.image];
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: images,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'vivi.ge',
    },
    offers: {
      '@type': 'Offer',
      url: product.url,
      priceCurrency: product.currency || 'GEL',
      price: String(product.price),
      availability: `https://schema.org/${product.availability === 'in stock' ? 'InStock' : product.availability === 'out of stock' ? 'OutOfStock' : 'PreOrder'}`,
      seller: {
        '@type': 'Organization',
        name: 'vivi.ge',
        url: siteUrl,
      },
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
    },
    ...(product.category && {
      category: product.category,
    }),
    ...(product.sku && {
      sku: product.sku,
      mpn: product.sku, // Manufacturer Part Number
    }),
    ...(product.aggregateRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.aggregateRating.ratingValue,
        reviewCount: product.aggregateRating.reviewCount,
      },
    }),
  };
}

export function generateOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'vivi.ge',
    url: siteUrl,
    logo: `${siteUrl}/img/logo.png`,
    description: defaultDescription,
    sameAs: [
      // Add social media links here when available
      // 'https://www.facebook.com/vivige',
      // 'https://www.instagram.com/vivige',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['Georgian', 'English'],
    },
  };
}

export function generateWebsiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/products?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

