'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ShoppingCart, Search, Package, Truck, Shield, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Dynamically import the ProductSlider component with no SSR
const ProductSlider = dynamic(() => import('../components/ProductSlider'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-600"></div>
    </div>
  ),
});

// Dynamically import the HomeSlider component
const HomeSlider = dynamic(() => import('../components/HomeSlider'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-[500px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-600"></div>
    </div>
  ),
});

interface Category {
  categoryId: string;
  name: string;
  image: string;
  mobileImage: string;
  slug: string;
}

interface WidgetGroup {
  _id: string;
  groupNumber: number;
  widgetName: string;
  categories: Category[];
}

// Note: Since this is a client component, we'll export metadata from a separate file
// For Next.js 14, we need to create a metadata export in a server component wrapper
// or use generateMetadata in a parent layout

export default function Home() {
  const router = useRouter();
  const [widgetGroups, setWidgetGroups] = useState<WidgetGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWidgetGroups = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/widget-groups`);
        const data = await response.json();
        
        if (data.success) {
          setWidgetGroups(data.data);
        }
      } catch (error) {
        console.error('Error fetching widget groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWidgetGroups();
  }, []);

  const handleCategoryClick = (slug: string) => {
    router.push(`/products?category=${slug}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-600"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative">
        <div className="container mx-auto">
          <HomeSlider />
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-10 px-3 bg-white">
        <div className="container mx-auto">
          {widgetGroups.map((group) => (
            <div key={group._id} className="mb-12">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-6">
                 {group.widgetName}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {group.categories.map((category) => (
                  <div
                    key={category.categoryId}
                    onClick={() => handleCategoryClick(category.slug)}
                                         className="relative w-full h-[160px] md:h-[200px] bg-sky-200 hover:bg-sky-300 rounded-lg cursor-pointer transition duration-300 overflow-hidden group"
                  >
                    {(category.image || category.mobileImage) ? (
                      <picture>
                        {/* Mobile image */}
                        {category.mobileImage && (
                          <source
                            media="(max-width: 768px)"
                            srcSet={category.mobileImage}
                          />
                        )}
                        {/* Desktop image */}
                        {category.image && (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                        {/* Fallback to mobile image if no desktop image */}
                        {!category.image && category.mobileImage && (
                          <img
                            src={category.mobileImage}
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </picture>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-700 group-hover:text-sky-600 font-medium">
                          {category.name}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium">
                        {category.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {widgetGroups.length === 0 && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-gray-700">No Widget Groups Available</h2>
              <p className="mt-2 text-gray-500">Please add some widget groups from the admin panel.</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-10 px-3 bg-white">
        <div className="container mx-auto">
          <ProductSlider title="გამორჩეული პროდუქტები" />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-6 md:py-10 px-3 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-16">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-600">
              როგორ მუშაობს?
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            <div className="bg-gray-50 p-6 md:p-8 rounded-xl md:rounded-2xl text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-sky-100 rounded-full flex items-center justify-center mb-4 md:mb-6 mx-auto">
                <Search className="text-sky-600" size={20} />
              </div>
              <h3 className="text-lg md:text-2xl text-gray-900 font-semibold mb-3 md:mb-4">1. დაათვალიერე & მოძებნე</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">აარჩიე პროდუქცია სხვადასხვა მაღაზიიდან ერთ სივრცეში</p>
            </div>
            <div className="bg-gray-50 p-6 md:p-8 rounded-xl md:rounded-2xl text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-sky-100 rounded-full flex items-center justify-center mb-4 md:mb-6 mx-auto">
                <ShoppingCart className="text-sky-600" size={20} />
              </div>
              <h3 className="text-lg md:text-2xl text-gray-900 font-semibold mb-3 md:mb-4">2. დაამატე კალათაში</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">აირჩიე შენი სასურველი პროდუქტი და დაამატე კალათაში</p>
            </div>
            <div className="bg-gray-50 p-6 md:p-8 rounded-xl md:rounded-2xl text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-sky-100 rounded-full flex items-center justify-center mb-4 md:mb-6 mx-auto">
                <Package className="text-sky-600" size={20} />
              </div>
              <h3 className="text-lg md:text-2xl text-gray-900 font-semibold mb-3 md:mb-4">3. დაელოდეთ კურიერს</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">მიიღეთ ამანათი თქვენს მისამართზე</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 px-3 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4">
              <Truck className="text-sky-600" size={32} />
              <div>
                <h3 className="font-semibold text-gray-900">სწრაფი მიტანა</h3>
                <p className="text-gray-600">სწრაფი მიტანა თქვენს მიმართზე</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Shield className="text-sky-600" size={32} />
              <div>
                <h3 className="font-semibold text-gray-900">დაცული გადახდები</h3>
                <p className="text-gray-600">100% დაცული გადახდები</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Package className="text-sky-600" size={32} />
              <div>
                <h3 className="font-semibold text-gray-900">ხარისხიანი პროდუქცია</h3>
                <p className="text-gray-600">ვერიფიცირებული მაღაზიები და პროდუქტები</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-8 md:py-16 px-3 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-xl md:text-3xl text-gray-900 font-bold mb-3 md:mb-4">გამოიწერეთ ჩვენი გვერდი და მიიღეთ სიახლეები</h2>
            <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8 leading-relaxed">იყავით ინფორმირებული უახლესი პროდუქტებისა და შეთავაზებების შესახებ</p>
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              <input
                type="email"
                placeholder="შეიყვანეთ თქვენი ელ-ფოსტა"
                className="flex-1 px-4 py-3 md:py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm md:text-base"
              />
              <button className="bg-sky-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-sky-700 transition duration-300 text-sm md:text-base whitespace-nowrap">
                გამოწერა
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
