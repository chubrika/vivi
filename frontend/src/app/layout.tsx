import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import NavbarWrapper from '../components/NavbarWrapper';
import AuthProviderWrapper from '../components/AuthProviderWrapper';
import CartProviderWrapper from '../components/CartProviderWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'vivi.ge',
  description: 'Your one-stop shop for all your needs',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProviderWrapper>
          <CartProviderWrapper>
            <NavbarWrapper />
            {children}
          </CartProviderWrapper>
        </AuthProviderWrapper>
      </body>
    </html>
  );
} 