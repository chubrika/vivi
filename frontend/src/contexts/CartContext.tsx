'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../utils/authContext';
import { api } from '../utils/api';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  sellerId: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: async () => {},
  removeItem: async () => {},
  updateQuantity: async () => {},
  clearCart: async () => {},
  loading: false,
  error: null,
});

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, isAuthenticated } = useAuth();

  // Fetch cart on mount and when auth state changes
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchCart();
    }
  }, [isAuthenticated, token]);

  const fetchCart = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const data = await api.get('/api/cart', token);
      setItems(data.items || []);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (item: CartItem) => {
    if (!token) return;
    
    try {
      setLoading(true);
      const updatedItems = [...items, item];
      
      const data = await api.put('/api/cart', { items: updatedItems }, token);
      setItems(data.items);
    } catch (err) {
      console.error('Error adding item to cart:', err);
      setError(err instanceof Error ? err.message : 'Failed to add item to cart');
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: string) => {
    if (!token) return;
    
    try {
      setLoading(true);
      const updatedItems = items.filter(item => item.id !== itemId);
      
      const data = await api.put('/api/cart', { items: updatedItems }, token);
      setItems(data.items);
    } catch (err) {
      console.error('Error removing item from cart:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove item from cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!token) return;
    
    try {
      setLoading(true);
      const updatedItems = items.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );
      
      const data = await api.put('/api/cart', { items: updatedItems }, token);
      setItems(data.items);
    } catch (err) {
      console.error('Error updating item quantity:', err);
      setError(err instanceof Error ? err.message : 'Failed to update item quantity');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      await api.delete('/api/cart', token);
      setItems([]);
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError(err instanceof Error ? err.message : 'Failed to clear cart');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        loading,
        error,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext); 