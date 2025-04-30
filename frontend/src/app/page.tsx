import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import the ProductSlider component with no SSR
const ProductSlider = dynamic(() => import('../components/ProductSlider'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-purple-700 via-purple-600 to-blue-600 text-white py-24">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2 space-y-8">
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                კეთილი იყოს თქვენი მობრძანება{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                  VIVI შოპში
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-100 leading-relaxed">
                აღმოაჩინეთ საოცარი პროდუქტები საუკეთესო ფასებში. შეიძინეთ და ისიამოვნეთ ჩვენი ფართო არჩევანით.
              </p>
              <div className="flex gap-4">
                <Link
                  href="/products"
                  className="bg-white text-purple-700 px-8 py-4 rounded-full font-semibold hover:bg-opacity-90 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Shop Now
                </Link>
                <Link
                  href="/about"
                  className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-purple-700 transition duration-300"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl h-[500px] w-full flex items-center justify-center shadow-2xl transform hover:scale-105 transition duration-300">
                <span className="text-8xl">🛍️</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
              Featured Products
            </span>
          </h2>
          <ProductSlider />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
              Why Choose Us
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
              <div className="text-purple-600 text-5xl mb-6">🚚</div>
              <h3 className="text-2xl font-semibold mb-4">Fast Delivery</h3>
              <p className="text-gray-600 leading-relaxed">Quick and reliable shipping to your doorstep with real-time tracking.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
              <div className="text-purple-600 text-5xl mb-6">💰</div>
              <h3 className="text-2xl font-semibold mb-4">Best Prices</h3>
              <p className="text-gray-600 leading-relaxed">Competitive prices and regular deals with exclusive member discounts.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
              <div className="text-purple-600 text-5xl mb-6">🛡️</div>
              <h3 className="text-2xl font-semibold mb-4">Secure Shopping</h3>
              <p className="text-gray-600 leading-relaxed">Safe and protected transactions with advanced security measures.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-purple-700 to-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to Start Shopping?</h2>
          <p className="text-xl md:text-2xl mb-12 text-gray-100">Join our community of happy customers today!</p>
          <Link
            href="/register"
            className="inline-block bg-white text-purple-700 px-10 py-4 rounded-full font-semibold text-lg hover:bg-opacity-90 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Sign Up Now
          </Link>
        </div>
      </section>
    </main>
  );
} 