'use client';

import { useCart } from '../utils/cartContext';
import { Product } from '../types/product';

interface AddToCartButtonProps {
  product: Product;
  quantity?: number;
  className?: string;
}

export default function AddToCartButton({ product, quantity = 1, className = '' }: AddToCartButtonProps) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.images[0],
      sellerId: product.seller._id
    });
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={!product.isActive || product.stock <= 0}
      className={`w-full border-2 border-purple-500 px-4 py-2 rounded hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 ${className}`}
    >
       კალათაში დამატება
    </button>
  );
} 