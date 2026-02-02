import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchProductById } from '@/src/lib/api';
import ProductClient from './ProductClient';

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await fetchProductById(params.slug);

  if (!product) {
    notFound();
  }

  const descriptionText = product.description
    ? product.description.replace(/<[^>]*>/g, '').substring(0, 200)
    : '';
  const categoryName =
    typeof product.category === 'object' && product.category !== null
      ? product.category.name
      : '';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              href="/products"
              className="text-gray-500 hover:text-gray-700"
              aria-label="Back to products"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <article
          itemScope
          itemType="https://schema.org/Product"
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          <div className="p-6">
            <h1
              itemProp="name"
              className="text-2xl md:text-3xl font-bold text-gray-900 mb-4"
            >
              {product.name}
            </h1>

            <div className="hidden" itemScope itemType="https://schema.org/Offer">
              <span
                itemProp="price"
                content={String(product.discountedPrice || product.price)}
              />
              <span itemProp="priceCurrency" content="GEL" />
              <link
                itemProp="availability"
                href={
                  product.stock > 0
                    ? 'https://schema.org/InStock'
                    : 'https://schema.org/OutOfStock'
                }
              />
            </div>

            <div className="mb-8">
              <div className="relative aspect-square rounded-lg overflow-hidden mb-4">
                <img
                  itemProp="image"
                  src={
                    product.images?.length > 0
                      ? product.images[0]
                      : 'https://via.placeholder.com/400'
                  }
                  alt={product.name}
                  className="object-cover w-full h-full"
                  loading="eager"
                  width={800}
                  height={800}
                />
              </div>
              {product.images && product.images.length > 1 && (
                <div className="flex flex-wrap gap-4">
                  {product.images.slice(1, 5).map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden w-20 h-20"
                    >
                      <img
                        src={image}
                        alt={`${product.name} - Image ${index + 2}`}
                        className="object-cover w-full h-full"
                        loading="lazy"
                        width={80}
                        height={80}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <p
                  className="text-3xl font-semibold text-sky-600"
                  itemProp="offers"
                  itemScope
                  itemType="https://schema.org/Offer"
                >
                  <span
                    itemProp="price"
                    content={String(
                      product.discountedPrice || product.price
                    )}
                  >
                    {(product.discountedPrice || product.price).toFixed(2)} ₾
                  </span>
                  {product.discountedPrice &&
                    product.price > product.discountedPrice && (
                      <span className="ml-2 text-lg text-gray-500 line-through">
                        {product.price.toFixed(2)} ₾
                      </span>
                    )}
                </p>
                <meta itemProp="priceCurrency" content="GEL" />
                <link
                  itemProp="availability"
                  href={
                    product.stock > 0
                      ? 'https://schema.org/InStock'
                      : 'https://schema.org/OutOfStock'
                  }
                />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">მარაგი</h2>
                <p className="mt-1 text-gray-600">
                  {product.stock > 0
                    ? `${product.stock} ცალი ხელმისაწვდომია`
                    : 'არ არის მარაგში'}
                </p>
              </div>

              {categoryName && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    კატეგორია
                  </h2>
                  <p className="mt-1 text-gray-600" itemProp="category">
                    {categoryName}
                  </p>
                </div>
              )}

              <div>
                <h2 className="text-lg font-semibold text-gray-900">აღწერა</h2>
                <div
                  className="mt-2 text-gray-600 prose max-w-none"
                  itemProp="description"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
                {descriptionText && (
                  <p className="sr-only">{descriptionText}</p>
                )}
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">Seller</h2>
                <p className="mt-1 text-gray-600">
                  {typeof product.seller === 'object' && product.seller !== null
                    ? product.seller.storeName
                    : ''}
                </p>
              </div>

              <div className="pt-6">
                <ProductClient product={product} />
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
