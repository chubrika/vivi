import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'პროფილი - vivi.ge',
  description: 'ჩემი პროფილი',
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
