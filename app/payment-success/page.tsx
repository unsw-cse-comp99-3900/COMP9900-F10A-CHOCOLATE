"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useCart } from '@/lib/CartContext';

interface DemoOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface DemoOrder {
  id: string;
  email: string;
  items: DemoOrderItem[];
  total: number;
  totalAmount?: number;
  status: string;
  createdAt: string;
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const { clearCart, updateCartCount } = useCart();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<DemoOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartCleared, setCartCleared] = useState(false);

  useEffect(() => {
    if (!cartCleared) {
      clearCart();
      updateCartCount(0);
      setCartCleared(true);
    }
    
    const id = searchParams.get('orderId');
    if (!orderId && id) {
      setOrderId(id);
      
      if (id.startsWith('demo-')) {
        try {
          const demoOrderStr = localStorage.getItem('demoOrder');
          if (demoOrderStr) {
            const demoOrder = JSON.parse(demoOrderStr);
            setOrderDetails(demoOrder);
          }
        } catch (error) {
          console.error('Error parsing demo order:', error);
        }
        setLoading(false);
      } else if (isLoggedIn) {
        fetchOrderDetails(id);
      } else {
        setLoading(false);
      }
    }
  }, [searchParams, isLoggedIn, clearCart, updateCartCount, cartCleared, orderId]);

  const fetchOrderDetails = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
        },
        cache: 'no-store'
      });

      if (response.ok) {
        const data = await response.json();
        // 计算订单总金额（如果API没有返回totalAmount或为0）
        if (!data.totalAmount || data.totalAmount === 0) {
          const calculatedTotal = data.items?.reduce((sum: number, item: any) => {
            return sum + (item.quantity * (item.product?.price || item.price || 0));
          }, 0) || 0;
          
          data.total = calculatedTotal;
        } else {
          data.total = data.totalAmount;
        }
        
        setOrderDetails(data);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrdersClick = () => {
    setTimeout(() => {
      router.push(user?.role === "FARMER" ? "/farmer-orders?fromPayment=true" : "/order-page?fromPayment=true");
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle className="h-24 w-24 text-green-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Payment Successful!
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            Thank you for your purchase from Fresh Harvest.
          </p>
          {orderId && (
            <p className="mt-2 text-gray-600">
              Order ID: <span className="font-medium">{orderId}</span>
            </p>
          )}
        </div>

        <div className="mt-10 bg-white rounded-lg p-6 shadow-sm">
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-medium text-gray-900">Order Confirmation</h2>
            <p className="mt-2 text-sm text-gray-500">
              We've sent a confirmation email to {orderDetails?.email || user?.email || 'your email address'}.
              {isLoggedIn && ' You can view your order details in your account.'}
            </p>
          </div>

          {loading ? (
            <div className="mt-6 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : orderDetails ? (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="text-base font-medium text-gray-900">Order Summary</h3>
              <div className="mt-4 space-y-4">
                {orderDetails.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <div>
                      <span className="font-medium">{item.name || `Product #${item.productId}`}</span>
                      <span className="text-gray-500 ml-2">x {item.quantity}</span>
                    </div>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                
                <div className="pt-4 border-t border-gray-200 flex justify-between font-medium">
                  <span>Total</span>
                  <span>${(orderDetails.total || orderDetails.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="mt-6 bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-600">
                  Your items will be shipped to you soon. You'll receive shipping updates via email.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-6 py-4 text-center text-gray-500">
              Order details not available.
            </div>
          )}

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Link href="/" className="w-full sm:w-auto">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded">
                Continue Shopping
              </Button>
            </Link>
            
            {isLoggedIn && (
              <Button 
                variant="outline" 
                className="w-full border-green-600 text-green-600 hover:bg-green-50 py-3 rounded"
                onClick={handleViewOrdersClick}
              >
                View My Orders
              </Button>
            )}
          </div>
        </div>

        <div className="mt-12 text-center">
          <Image 
            src="/success-illustration.png" 
            alt="Success Illustration" 
            width={300} 
            height={200}
            className="mx-auto"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      </div>
    </div>
  );
}
