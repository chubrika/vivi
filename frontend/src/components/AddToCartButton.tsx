'use client';

import { useCart } from '../utils/cartContext';

interface AddToCartButtonProps {
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    seller: {
      _id: string;
    };
    isActive: boolean;
    stock: number;
  };
  className?: string;
}

export default function AddToCartButton({ product, className = '' }: AddToCartButtonProps) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0],
      sellerId: product.seller._id
    });
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={!product.isActive || product.stock <= 0}
      className={`bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      Add to Cart
    </button>
  );
} 