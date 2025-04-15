'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth, getToken } from './authContext';
import { API_BASE_URL } from './api';

// Define the CartItem interface
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  sellerId: string;
}

// Define the CartContext interface
interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
}

// Create the context with default values
const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  totalPrice: 0,
  isLoading: true,
});

// Create a provider component
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user, token, refreshToken } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate total items and price
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);

  // Load cart data from localStorage or API when component mounts
  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true);
      
      if (isAuthenticated && user) {
        try {
          // Get a validated token
          const validToken = getToken();
          if (!validToken) {
            console.error('Invalid token detected in cart context');
            // Fallback to localStorage
            const localCart = localStorage.getItem('cart');
            if (localCart) {
              setItems(JSON.parse(localCart));
            }
            setIsLoading(false);
            return;
          }
          
          // Fetch cart from API for logged-in users
          const response = await fetch(`${API_BASE_URL}/api/cart`, {
            headers: {
              'Authorization': `Bearer ${validToken}`
            }
          });
          
          if (response.status === 401 && !isRefreshing) {
            // Token expired, try to refresh
            setIsRefreshing(true);
            const refreshed = await refreshToken();
            setIsRefreshing(false);
            
            if (refreshed) {
              // Get the new token after refresh
              const newToken = getToken();
              if (!newToken) {
                console.error('Invalid token received after refresh');
                // Fallback to localStorage
                const localCart = localStorage.getItem('cart');
                if (localCart) {
                  setItems(JSON.parse(localCart));
                }
                setIsLoading(false);
                return;
              }
              
              // Retry the fetch with the new token
              const newResponse = await fetch(`${API_BASE_URL}/api/cart`, {
                headers: {
                  'Authorization': `Bearer ${newToken}`
                }
              });
              
              if (newResponse.ok) {
                const data = await newResponse.json();
                setItems(data.items || []);
              } else {
                // If API call fails, try to load from localStorage as fallback
                const localCart = localStorage.getItem('cart');
                if (localCart) {
                  setItems(JSON.parse(localCart));
                }
              }
            } else {
              // If refresh failed, load from localStorage
              const localCart = localStorage.getItem('cart');
              if (localCart) {
                setItems(JSON.parse(localCart));
              }
            }
          } else if (response.ok) {
            const data = await response.json();
            setItems(data.items || []);
          } else {
            // If API call fails, try to load from localStorage as fallback
            const localCart = localStorage.getItem('cart');
            if (localCart) {
              setItems(JSON.parse(localCart));
            }
          }
        } catch (error) {
          console.error('Error loading cart from API:', error);
          // Fallback to localStorage
          const localCart = localStorage.getItem('cart');
          if (localCart) {
            setItems(JSON.parse(localCart));
          }
        }
      } else {
        // For guest users, load from localStorage
        const localCart = localStorage.getItem('cart');
        if (localCart) {
          setItems(JSON.parse(localCart));
        }
      }
      
      setIsLoading(false);
    };

    loadCart();
  }, [isAuthenticated, user, token, refreshToken, isRefreshing]);

  // Save cart to localStorage or API when items change
  useEffect(() => {
    if (!isLoading) {
      // Always save to localStorage for guest users and as a fallback
      localStorage.setItem('cart', JSON.stringify(items));
      
      // For logged-in users, also save to API
      if (isAuthenticated && user) {
        const saveCartToAPI = async () => {
          try {
            // Get a validated token
            const validToken = getToken();
            if (!validToken) {
              console.error('Invalid token detected when saving cart');
              return;
            }
            
            const response = await fetch(`${API_BASE_URL}/api/cart`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${validToken}`
              },
              body: JSON.stringify({ items })
            });
            
            if (response.status === 401 && !isRefreshing) {
              // Token expired, try to refresh
              setIsRefreshing(true);
              const refreshed = await refreshToken();
              setIsRefreshing(false);
              
              if (refreshed) {
                // Get the new token after refresh
                const newToken = getToken();
                if (!newToken) {
                  console.error('Invalid token received after refresh when saving cart');
                  return;
                }
                
                // Retry the save with the new token
                await fetch(`${API_BASE_URL}/api/cart`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${newToken}`
                  },
                  body: JSON.stringify({ items })
                });
              }
            }
          } catch (error) {
            console.error('Error saving cart to API:', error);
          }
        };
        
        saveCartToAPI();
      }
    }
  }, [items, isAuthenticated, user, token, refreshToken, isLoading, isRefreshing]);

  // Add an item to the cart
  const addItem = (newItem: CartItem) => {
    setItems(prevItems => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(item => item.id === newItem.id);
      
      if (existingItemIndex >= 0) {
        // If item exists, update quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += newItem.quantity;
        return updatedItems;
      } else {
        // If item doesn't exist, add it to cart
        return [...prevItems, newItem];
      }
    });
  };

  // Remove an item from the cart
  const removeItem = (itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  // Update the quantity of an item
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  // Clear the cart
  const clearCart = () => {
    setItems([]);
  };

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    isLoading
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext); 