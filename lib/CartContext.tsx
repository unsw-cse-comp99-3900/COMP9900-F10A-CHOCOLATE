"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the cart item interface
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  refreshCart: () => void;
  clearCart: () => void;
  cartCount: number;
  updateCartCount: (count: number) => void;
  incrementCartCount: () => void;
}

// Create context with default values
const CartContext = createContext<CartContextType | undefined>(undefined);

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Provider component
export const CartProvider = ({ 
  children 
}: { 
  children: ReactNode;
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  
  // Load cart items and update cart count
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        const items = JSON.parse(storedCart);
        setCartItems(items);
        // Calculate total quantity from all items
        const totalQuantity = items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
        setCartCount(totalQuantity);
      } catch (e) {
        console.error('Failed to parse cart from localStorage:', e);
        localStorage.removeItem('cart');
      }
    }
  }, []);
  
  // Save cart items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);
  
  // Load cart count from localStorage on initial render
  useEffect(() => {
    const savedCount = localStorage.getItem('cartCount');
    if (savedCount) {
      setCartCount(parseInt(savedCount));
    }
  }, []);
  
  // Save cart count to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cartCount', cartCount.toString());
  }, [cartCount]);
  
  // Add item to cart
  const addToCart = (item: CartItem) => {
    setCartItems(prev => {
      // Check if item already exists in cart
      const existingItemIndex = prev.findIndex(i => i.id === item.id);
      
      let updatedCart;
      if (existingItemIndex !== -1) {
        // Item exists, update quantity
        updatedCart = [...prev];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + item.quantity
        };
      } else {
        // Item doesn't exist, add it
        updatedCart = [...prev, item];
      }
      
      // Update total quantity
      const totalQuantity = updatedCart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalQuantity);
      
      return updatedCart;
    });
  };
  
  // Remove item from cart
  const removeFromCart = (id: string) => {
    setCartItems(prev => {
      const updatedCart = prev.filter(item => item.id !== id);
      // Update total quantity
      const totalQuantity = updatedCart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalQuantity);
      return updatedCart;
    });
  };
  
  // Refresh cart (fetch from server if needed)
  const refreshCart = async () => {
    // If you're using a server-stored cart, fetch it here
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setCartItems(data.map((item: any) => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            imageUrl: item.product.imageUrl
          })));
        }
      }
    } catch (err) {
      console.error('Failed to refresh cart:', err);
    }
  };
  
  // Clear cart
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };
  
  // Update cart count
  const updateCartCount = (count: number) => {
    setCartCount(count);
    localStorage.setItem('cartCount', count.toString());
  };
  
  // Increment cart count
  const incrementCartCount = () => {
    const newCount = cartCount + 1;
    setCartCount(newCount);
    localStorage.setItem('cartCount', newCount.toString());
  };
  
  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      refreshCart,
      clearCart,
      cartCount,
      updateCartCount,
      incrementCartCount
    }}>
      {children}
    </CartContext.Provider>
  );
}; 