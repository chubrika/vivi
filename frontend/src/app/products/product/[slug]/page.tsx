import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import {
  fetchProductById,
  fetchProducts,
  fetchCategories,
  fetchFiltersForCategory,
} from '@/src/lib/api';
import ProductsLayoutClient from '../../ProductsLayoutClient';

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const [product, products, categories, filters] = await Promise.all([
    fetchProductById(params.slug),
    fetchProducts({}),
    fetchCategories(),
    fetchFiltersForCategory(null),
  ]);

  if (!product) {
    notFound();
  }

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
        initialSelectedProduct={product}
      />
    </Suspense>
  );
}
