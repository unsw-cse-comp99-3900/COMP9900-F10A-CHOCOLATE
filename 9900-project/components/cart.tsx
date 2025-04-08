"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/CartContext";
import { useRouter } from "next/navigation";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const Cart = ({ isOpen, onClose }: CartProps) => {
  const { cartItems, removeFromCart } = useCart();
  const router = useRouter();

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Navigate to payment page
  const handlePay = () => {
    onClose();
    router.push("/payment-page");
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-full md:w-[400px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between p-6 border-b">
        <h3 className="text-xl font-semibold">SHOPPING CART</h3>
        <button onClick={onClose} className="text-gray-600 hover:text-gray-800 flex items-center">
          <X size={20} /> <span className="ml-2">CLOSE</span>
        </button>
      </div>

      <div className="p-6 flex flex-col gap-4 overflow-y-auto h-[calc(100%-180px)]">
        {cartItems.length === 0 ? (
          <p className="text-center text-gray-500">Your cart is empty.</p>
        ) : (
          cartItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4 border-b pb-4">
              <div className="relative w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                <Image
                  src={item.imageUrl || "/product-placeholder.jpg"}
                  alt={item.name}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{item.name}</h4>
                <p className="text-sm text-gray-600">
                  {item.quantity} × <span className="font-semibold">${item.price.toFixed(2)}</span>
                </p>
              </div>
              <button
                className="text-gray-400 hover:text-red-500"
                onClick={() => removeFromCart(item.id)}
                aria-label="Remove item"
              >
                <X size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="absolute bottom-0 w-full p-6 border-t bg-white">
        <div className="flex justify-between text-xl font-bold mb-4">
          <span>SUBTOTAL:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <Button
          onClick={handlePay}
          className="w-full bg-black text-white hover:bg-black/90"
          disabled={cartItems.length === 0}
        >
          CHECKOUT
        </Button>
      </div>
    </div>
  );
};

export default Cart;