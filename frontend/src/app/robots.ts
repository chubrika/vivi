import { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vivi.ge';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/auth/',
          '/checkout/',
          '/profile/',
          '/order-confirmation/',
          '/invoice/',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

