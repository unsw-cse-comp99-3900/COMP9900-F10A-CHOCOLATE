"use client";

import React, { createContext, useContext, ReactNode } from 'react';

interface CartContextType {
  refreshCart: () => void;
}

// Create context with a default empty function
const CartContext = createContext<CartContextType>({
  refreshCart: () => {},
});

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);

// Provider component
export const CartProvider = ({ 
  children,
  refreshCart
}: { 
  children: ReactNode;
  refreshCart: () => void;
}) => {
  return (
    <CartContext.Provider value={{ refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}; 