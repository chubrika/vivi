import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { fetchSellerPublicBySlug, fetchProductsBySeller } from '@/src/lib/api';
import type { Product } from '@/src/types/product';

export default async function ShopDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const [seller, products] = await Promise.all([
    fetchSellerPublicBySlug(params.slug),
    fetchProductsBySeller(params.slug),
  ]);

  if (!seller) {
    notFound();
  }

  const storeName = seller.sellerProfile?.storeName ?? '';
  const status = seller.sellerProfile?.status ?? '';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/shops"
          className="text-sky-600 hover:text-sky-800 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          უკან
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-4">
          <div className="flex justify-between items-start">
            <h1 className="text-xl font-semibold text-gray-900">{storeName}</h1>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium ${
                status === 'approved'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {status === 'approved' ? 'აქტიური' : 'შეჩერებული'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">
          პროდუქტები {storeName}-დან
        </h2>

        {products.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            ამ მაღაზიიდან პროდუქტები ჯერ არ არის.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product: Product) => (
              <Link
                href={`/products/product/${product._id}`}
                key={product._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative aspect-square">
                  {product.images?.length > 0 ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-sky-600 font-medium">
                    {product.price.toFixed(2)} ₾
                  </p>
                  {product.category &&
                    typeof product.category === 'object' && (
                      <p className="text-sm text-gray-500 mt-1">
                        {product.category.name}
                      </p>
                    )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
