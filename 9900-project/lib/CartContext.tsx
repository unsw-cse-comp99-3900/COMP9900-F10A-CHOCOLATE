"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// Define the cart item interface
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  farm: string; 
}

// Interface for backend cart operations
interface BackendCartItem {
  productId: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  refreshCart: () => void;
  clearCart: () => void;
  isCartLoading: boolean;
}

// Create context with default values
const CartContext = createContext<CartContextType>({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  refreshCart: () => {},
  clearCart: () => {},
  isCartLoading: false,
});

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);

// Provider component
export const CartProvider = ({ 
  children 
}: { 
  children: ReactNode;
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const { user } = useAuth();
  
  // Load cart items from backend if logged in, otherwise from localStorage
  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      // Load from localStorage if not logged in
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        try {
          setCartItems(JSON.parse(storedCart));
        } catch (e) {
          console.error('Failed to parse cart from localStorage:', e);
          localStorage.removeItem('cart');
        }
      }
    }
  }, [user]);
  
  // Save cart items to localStorage whenever they change (for non-logged in users)
  useEffect(() => {
    if (!user) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  // Sync local cart with backend when user logs in
  useEffect(() => {
    if (user?.role === 'CUSTOMER') {
      syncWithBackend();
    }
  }, [user]);
  
  // Function to sync localStorage cart with backend after login
  const syncWithBackend = async () => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart && user) {
      try {
        const localCartItems = JSON.parse(storedCart);
        
        // Skip if cart is empty
        if (localCartItems.length === 0) return;
        
        setIsCartLoading(true);
        
        // Add each local cart item to the backend
        for (const item of localCartItems) {
          await addToBackend({
            productId: item.id,
            quantity: item.quantity
          });
        }
        
        // Clear local storage after syncing
        localStorage.removeItem('cart');
        
        // Refresh cart from backend
        await refreshCart();
      } catch (error) {
        console.error('Failed to sync cart with backend:', error);
      } finally {
        setIsCartLoading(false);
      }
    }
  };
  
  // Add item to backend
  const addToBackend = async (item: BackendCartItem): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) return false;
      
      const response = await fetch('http://localhost:5001/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(item)
      });
      
      return response.ok;
    } catch (error) {
      console.error('Failed to add item to backend cart:', error);
      return false;
    }
  };
  
  // Remove item from backend
  const removeFromBackend = async (cartItemId: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) return false;
      
      const response = await fetch(`http://localhost:5001/api/cart/${cartItemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Failed to remove item from backend cart:', error);
      return false;
    }
  };
  
  // Add item to cart
  const addToCart = async (item: CartItem) => {
    // If user is logged in, add to backend
    if (user?.role === 'CUSTOMER') {
      setIsCartLoading(true);
      const success = await addToBackend({
        productId: item.id,
        quantity: item.quantity
      });
      
      if (success) {
        // Refresh cart from backend to ensure consistency
        await refreshCart();
      } else {
        console.error('Failed to add item to backend cart');
      }
      setIsCartLoading(false);
    } else {
      // If not logged in, add to local state
      setCartItems(prev => {
        // Check if item already exists in cart
        const existingItemIndex = prev.findIndex(i => i.id === item.id);
        
        if (existingItemIndex !== -1) {
          // Item exists, update quantity
          const updatedCart = [...prev];
          updatedCart[existingItemIndex] = {
            ...updatedCart[existingItemIndex],
            quantity: updatedCart[existingItemIndex].quantity + item.quantity
          };
          return updatedCart;
        } else {
          // Item doesn't exist, add it
          return [...prev, item];
        }
      });
    }
  };
  
  // Remove item from cart
  const removeFromCart = async (id: string) => {
    // If user is logged in, remove from backend
    if (user?.role === 'CUSTOMER') {
      setIsCartLoading(true);
      
      // Find the cart item with product id
      const cartItem = cartItems.find(item => item.id === id);
      if (cartItem) {
        // We need the backend cart id, not the product id
        // This requires refreshing the cart first to get the mapping
        await refreshCart();
        
        // Now get the updated items which should have the backend ids
        const backendCartItems = await fetchBackendCart();
        
        // Find the backend cart item with matching product id
        const backendItem = backendCartItems.find((item: { product: { id: string; }; }) => item.product.id === id);
        
        if (backendItem) {
          const success = await removeFromBackend(backendItem.id);
          if (success) {
            // Refresh cart from backend to ensure consistency
            await refreshCart();
          } else {
            console.error('Failed to remove item from backend cart');
          }
        }
      }
      
      setIsCartLoading(false);
    } else {
      // If not logged in, remove from local state
      setCartItems(prev => prev.filter(item => item.id !== id));
    }
  };
  
  // Fetch cart from backend
  const fetchBackendCart = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) return [];
      
      const response = await fetch('http://localhost:5001/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch backend cart:', error);
      return [];
    }
  };
  
  // Refresh cart (fetch from backend if logged in)
  const refreshCart = async () => {
    if (user?.role === 'CUSTOMER') {
      setIsCartLoading(true);
      try {
        const backendCartItems = await fetchBackendCart();
        
        // Transform backend cart items to match our frontend format
        const transformedItems = backendCartItems.map((item: {
          id: string;
          quantity: number;
          product: {
            id: string;
            name: string;
            price: number;
            imageUrl?: string;
            store?: {
              name: string;
            };
          };
        }) => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          imageUrl: item.product.imageUrl,
          farm: item.product.store?.name || 'Unknown Farm'
        }));
        
        setCartItems(transformedItems);
      } catch (err) {
        console.error('Failed to refresh cart:', err);
      } finally {
        setIsCartLoading(false);
      }
    }
  };
  
  // Clear cart
  const clearCart = async () => {
    if (user?.role === 'CUSTOMER') {
      setIsCartLoading(true);
      try {
        // Get all cart items first
        const backendCartItems = await fetchBackendCart();
        
        // Delete each cart item one by one
        for (const item of backendCartItems) {
          await removeFromBackend(item.id);
        }
        
        // Refresh to confirm cart is empty
        await refreshCart();
      } catch (error) {
        console.error('Failed to clear backend cart:', error);
      } finally {
        setIsCartLoading(false);
      }
    } else {
      // If not logged in, just clear local state
      setCartItems([]);
      localStorage.removeItem('cart');
    }
  };
  
  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      refreshCart,
      clearCart,
      isCartLoading
    }}>
      {children}
    </CartContext.Provider>
  );
}; 