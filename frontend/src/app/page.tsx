import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ShoppingCart, Search, Package, Truck, Shield, Mail } from 'lucide-react';

// Dynamically import the ProductSlider component with no SSR
const ProductSlider = dynamic(() => import('../components/ProductSlider'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
    </div>
  ),
});

// Dynamically import the HomeSlider component
const HomeSlider = dynamic(() => import('../components/HomeSlider'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-[500px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative">
        <div className="container mx-auto">
          <HomeSlider />
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-10 bg-white">
        <div className="container mx-auto">
          <div className="flex flex-wrap gap-2">
            {['Electronics', 'Groceries', 'Clothing', 'Home & Garden'].map((category) => (
              <div
                key={category}
                className="w-[calc(50%-4px)] h-[200px] bg-purple-200 hover:bg-purple-1200 px-6 py-3 rounded-lg cursor-pointer transition duration-300"
              >
                <span className="text-gray-700 hover:text-purple-600 font-medium">{category}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-10 bg-white">
        <div className="container mx-auto">
          <ProductSlider title="გამორჩეული პროდუქტები" />
        </div>
      </section>

      {/* Trending Stores Section */}
      <section className="py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
              Trending Stores
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((store) => (
              <div key={store} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-300">
                <div className="w-20 h-20 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-3xl">🏪</span>
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">Store {store}</h3>
                <p className="text-gray-600 text-center">Specializing in unique products</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
              How It Works
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-2xl">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <Search className="text-purple-600" size={24} />
              </div>
              <h3 className="text-2xl font-semibold mb-4">1. Browse & Search</h3>
              <p className="text-gray-600">Explore products from multiple vendors in one place</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-2xl">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <ShoppingCart className="text-purple-600" size={24} />
              </div>
              <h3 className="text-2xl font-semibold mb-4">2. Add to Cart</h3>
              <p className="text-gray-600">Select your favorite items and add them to your cart</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-2xl">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <Package className="text-purple-600" size={24} />
              </div>
              <h3 className="text-2xl font-semibold mb-4">3. Receive Delivery</h3>
              <p className="text-gray-600">Get your products delivered to your doorstep</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4">
              <Truck className="text-purple-600" size={32} />
              <div>
                <h3 className="font-semibold">Fast Delivery</h3>
                <p className="text-gray-600">Quick shipping to your location</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Shield className="text-purple-600" size={32} />
              <div>
                <h3 className="font-semibold">Secure Payments</h3>
                <p className="text-gray-600">100% secure payment processing</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Package className="text-purple-600" size={32} />
              <div>
                <h3 className="font-semibold">Quality Products</h3>
                <p className="text-gray-600">Verified sellers and products</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-gray-600 mb-8">Stay updated with the latest products and offers</p>
            <div className="flex gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button className="bg-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-700 transition duration-300">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">VIVI</h3>
              <p className="text-gray-400">Your trusted multi-vendor marketplace</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
                <li><Link href="/faq" className="text-gray-400 hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2">
                <li><Link href="/electronics" className="text-gray-400 hover:text-white">Electronics</Link></li>
                <li><Link href="/clothing" className="text-gray-400 hover:text-white">Clothing</Link></li>
                <li><Link href="/groceries" className="text-gray-400 hover:text-white">Groceries</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
                <li><Link href="/cookies" className="text-gray-400 hover:text-white">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 VIVI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
} 