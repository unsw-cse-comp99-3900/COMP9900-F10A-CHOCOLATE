"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

interface OrderSummary {
  orderCount: number;
  orderIds: string[];
  total: number;
  createdAt: string;
}

interface OrderDetails {
  id: string;
  totalAmount: number;
  status: string;
  items: {
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      imageUrl?: string;
      store: {
        id: string;
        name: string;
      };
    };
  }[];
}

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Get the order summary from localStorage
      const ordersStr = localStorage.getItem('orders');
      if (ordersStr) {
        const orders = JSON.parse(ordersStr);
        setOrderSummary(orders);
        
        if (isLoggedIn && orders.orderIds && orders.orderIds.length > 0) {
          // Fetch details for all orders if user is logged in
          fetchOrdersDetails(orders.orderIds);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error parsing orders:', error);
      setLoading(false);
    }
  }, [isLoggedIn]);

  const fetchOrdersDetails = async (orderIds: string[]) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) return;
      
      const detailsPromises = orderIds.map(id => 
        fetch(`http://localhost:5001/api/orders/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
          if (response.ok) return response.json();
          throw new Error(`Failed to fetch order ${id}`);
        })
      );
      
      const results = await Promise.allSettled(detailsPromises);
      
      const successfulOrders = results
        .filter((result): result is PromiseFulfilledResult<OrderDetails> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value);
      
      setOrderDetails(successfulOrders);
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
          {orderSummary && (
            <p className="mt-2 text-gray-600">
              {orderSummary.orderCount > 1 ? (
                <>
                  You have placed {orderSummary.orderCount} orders
                </>
              ) : (
                <>
                  Order ID: <span className="font-medium">{orderSummary.orderIds[0]}</span>
                </>
              )}
            </p>
          )}
        </div>

        <div className="mt-10 bg-white rounded-lg p-6 shadow-sm">
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-medium text-gray-900">Order Confirmation</h2>
            <p className="mt-2 text-sm text-gray-500">
              We've sent a confirmation email to {user?.email || 'your email address'}.
              {isLoggedIn && ' You can view your order details in your account.'}
            </p>
          </div>

          {loading ? (
            <div className="mt-6 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : orderDetails.length > 0 ? (
            <div className="mt-6 border-t border-gray-200 pt-6 space-y-8">
              {orderDetails.map((order, orderIndex) => (
                <div key={order.id} className={orderIndex > 0 ? "pt-6 border-t border-gray-200" : ""}>
                  <h3 className="text-base font-medium text-gray-900">
                    Order from {order.items[0]?.product.store.name || 'Unknown Store'}
                  </h3>
                  <p className="text-sm text-gray-500">Order ID: {order.id}</p>
                  
                  <div className="mt-4 space-y-4">
                    {order.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex justify-between text-sm">
                        <div>
                          <span className="font-medium">{item.product.name}</span>
                          <span className="text-gray-500 ml-2">x {item.quantity}</span>
                        </div>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    
                    <div className="pt-4 border-t border-gray-200 flex justify-between font-medium">
                      <span>Order Total</span>
                      <span>${order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {orderSummary && (
                <div className="pt-4 border-t border-gray-200 flex justify-between font-bold text-lg">
                  <span>Grand Total</span>
                  <span>${orderSummary.total.toFixed(2)}</span>
                </div>
              )}
              
              <div className="mt-6 bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-600">
                  Your items will be shipped to you soon. You'll receive shipping updates via email.
                </p>
              </div>
            </div>
          ) : orderSummary ? (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="text-base font-medium text-gray-900">Order Summary</h3>
              <div className="mt-4">
                <p className="text-gray-600">
                  You've successfully placed {orderSummary.orderCount} {orderSummary.orderCount > 1 ? 'orders' : 'order'}.
                </p>
                
                <div className="pt-4 border-t border-gray-200 flex justify-between font-medium mt-4">
                  <span>Total</span>
                  <span>${orderSummary.total.toFixed(2)}</span>
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
              <Link href="/Customer-Order" className="w-full sm:w-auto">
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
