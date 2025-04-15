'use client';

import { CartProvider } from '../utils/cartContext';

export default function CartProviderWrapper({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
} 