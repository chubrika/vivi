import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'გადახდა',
  description: 'შეკვეთის დასრულება',
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
