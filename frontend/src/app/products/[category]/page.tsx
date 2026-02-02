import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import {
  fetchCategoryBySlug,
  fetchProducts,
  fetchCategories,
  fetchFiltersForCategory,
} from '@/src/lib/api';
import { generateMetadata as generateSEOMetadata } from '@/src/utils/seo';
import ProductsLayoutClient from '../ProductsLayoutClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vivi.ge';

export async function generateMetadata({
  params,
}: {
  params: { category: string };
}): Promise<Metadata> {
  const category = await fetchCategoryBySlug(params.category);
  if (!category) {
    return generateSEOMetadata({
      title: 'კატეგორია ვერ მოიძებნა',
      description: 'კატეგორია ვერ მოიძებნა',
    });
  }
  const description = category.description
    ? category.description.substring(0, 160)
    : `${category.name} - იპოვეთ პროდუქტები კატეგორიაში ${category.name} vivi.ge-ზე`;
  return generateSEOMetadata({
    title: category.name,
    description,
    url: `${siteUrl}/products/${params.category}`,
    category: category.name,
  });
}

export default async function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const [category, products, categories, filters] = await Promise.all([
    fetchCategoryBySlug(params.category),
    fetchProducts({ category: params.category }),
    fetchCategories(),
    fetchFiltersForCategory(params.category),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <ProductsLayoutClient
      initialProducts={products}
      initialCategories={categories}
      initialFilters={filters}
      categorySlug={params.category}
      categoryName={category.name}
    />
  );
}
