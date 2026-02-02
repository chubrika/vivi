import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'მაღაზიები - vivi.ge',
  description: 'გაეცანით vivi.ge-ის პარტნიორ მაღაზიებს. იპოვეთ საიმედო გამყიდველები და ხარისხიანი პროდუქტები.',
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function ShopsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

