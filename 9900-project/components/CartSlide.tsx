"use client";

import { useEffect, useRef } from 'react';
import { X, Trash, ShoppingBag, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';
import { useCart, CartItem } from '@/lib/CartContext';

interface CartSlideProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSlide = ({ isOpen, onClose }: CartSlideProps) => {
  const { cartItems, removeFromCart, isCartLoading } = useCart();
  const cartRef = useRef<HTMLDivElement>(null);

  // Calculate total price
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Close cart when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node) && isOpen) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevent scrolling when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle item removal
  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
  };

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div 
        ref={cartRef}
        className={`fixed top-0 right-0 w-full md:w-96 h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col`}
      >
        {/* Cart Header */}
        <div className="flex justify-between items-center px-4 py-4 border-b">
          <h2 className="text-xl font-semibold flex items-center">
            <ShoppingBag className="mr-2 h-5 w-5" /> 
            Your Cart ({cartItems.length})
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {isCartLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-4">Add items to your cart to see them here</p>
              <Button 
                onClick={onClose}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Start Shopping
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <li key={item.id} className="py-4 flex">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 relative">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover object-center"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder-product.png"; // Fallback image
                        }}
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                        <ShoppingBag className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex flex-1 flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <h3 className="line-clamp-1">{item.name}</h3>
                        <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-1">From {item.farm}</p>
                    </div>
                    <div className="flex flex-1 items-end justify-between text-sm">
                      <p className="text-gray-500">Qty {item.quantity}</p>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="font-medium text-red-600 hover:text-red-500 flex items-center"
                      >
                        <Trash className="h-4 w-4 mr-1" /> Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Cart Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
            <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
              <p>Subtotal</p>
              <p>${totalPrice.toFixed(2)}</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
            
              <Link href="/payment-page" passHref>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={onClose}
                >
                  Checkout <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="mt-4 text-center text-sm text-gray-500">
              <p>Shipping calculated at checkout</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSlide; 