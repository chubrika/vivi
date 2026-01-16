import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata } from '../../utils/seo';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vivi.ge';

export const metadata: Metadata = generateSEOMetadata({
  title: 'მაღაზიები - vivi.ge',
  description: 'გაეცანით vivi.ge-ის პარტნიორ მაღაზიებს. იპოვეთ საიმედო გამყიდველები და ხარისხიანი პროდუქტები.',
  url: `${siteUrl}/shops`,
});

export default function ShopsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

