import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'კალათა',
  description: 'ჩემი კალათა',
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
