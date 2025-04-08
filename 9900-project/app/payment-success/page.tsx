"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

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
  status: string;
  createdAt: string;
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<DemoOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the order ID from the URL query parameters
    const id = searchParams.get('orderId');
    setOrderId(id);

    // Check if this is a demo order from localStorage
    if (id && id.startsWith('demo-')) {
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
    } else if (id && isLoggedIn) {
      // This is a real order and user is logged in
      fetchOrderDetails(id);
    } else {
      setLoading(false);
    }
  }, [searchParams, isLoggedIn]);

  const fetchOrderDetails = async (id: string) => {
    try {
      // You would replace this with your actual API endpoint
      const response = await fetch(`http://localhost:5001/api/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrderDetails(data);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
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
                  <span>${orderDetails.total?.toFixed(2) || '0.00'}</span>
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
              <Link href="/account/orders" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50 py-3 rounded">
                  View My Orders
                </Button>
              </Link>
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
              // Fallback if image doesn't exist
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      </div>
    </div>
  );
}
