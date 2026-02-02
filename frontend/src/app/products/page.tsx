import { Suspense } from 'react';
import { Metadata } from 'next';
import {
  fetchProducts,
  fetchCategories,
  fetchFiltersForCategory,
} from '@/src/lib/api';
import ProductsLayoutClient from '../products/ProductsLayoutClient';

export const metadata: Metadata = {
  title: 'პროდუქტები',
  description:
    'იპოვეთ ყველაზე კარგი პროდუქტები vivi.ge-ზე. ფართო არჩევანი, საუკეთესო ფასები და სწრაფი მიტანა.',
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default async function ProductsPage() {
  const [products, categories, filters] = await Promise.all([
    fetchProducts({}),
    fetchCategories(),
    fetchFiltersForCategory(null),
  ]);

  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500" />
        </div>
      }
    >
      <ProductsLayoutClient
        initialProducts={products}
        initialCategories={categories}
        initialFilters={filters}
        categorySlug={null}
      />
    </Suspense>
  );
}
