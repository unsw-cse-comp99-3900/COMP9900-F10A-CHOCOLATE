"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Head from 'next/head';
import { useAuth } from '@/lib/AuthContext';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the order ID from the URL query parameters
    const id = searchParams.get('orderId');
    setOrderId(id);

    // If we have an order ID and the user is logged in, fetch order details
    if (id && isLoggedIn) {
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
    <>
      <Head>
        <title>Payment Successful | Fresh Harvest</title>
        <meta name="description" content="Your payment was successful. Thank you for shopping with Fresh Harvest!" />
      </Head>

      <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
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

          <div className="mt-10 bg-gray-50 rounded-lg p-6 shadow-sm">
            <div className="text-center sm:text-left">
              <h2 className="text-lg font-medium text-gray-900">Order Confirmation</h2>
              <p className="mt-2 text-sm text-gray-500">
                We've sent a confirmation email to {user?.email || 'your email address'}.
                You can view your order details in your account.
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
                  {/* This would display order items if available */}
                  <p className="text-gray-500">Your items will be shipped to you soon.</p>
                </div>
              </div>
            ) : null}

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
    </>
  );
}
