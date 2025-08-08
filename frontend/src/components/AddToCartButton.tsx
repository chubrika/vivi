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
      sellerId: typeof product.seller === 'string' ? product.seller : product.seller._id,
      discountedPercent: product.discountedPercent,
      discountStartDate: product.discountStartDate,
      discountEndDate: product.discountEndDate,
      discountedPrice: product.discountedPrice
    });
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={!product.isActive || product.stock <= 0}
      className={`w-full border-2 border-sky-500 px-4 py-2 rounded hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm text-gray-600 ${className}`}
    >
       კალათაში დამატება
    </button>
  );
} 