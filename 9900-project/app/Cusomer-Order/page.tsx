"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, Truck, Clock, XCircle, ChevronDown, ChevronUp, AlertCircle, Package } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Define interfaces for our order data
interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    imageUrl: string | null;
    description: string;
    store: {
      id: string;
      name: string;
    };
  };
}

interface Order {
  id: string;
  createdAt: string;
  totalAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  items: OrderItem[];
}

export default function CustomerOrderPage() {
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  // Fetch orders when component mounts
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login-page');
      return;
    }

    if (user?.role !== 'CUSTOMER') {
      setError('Only customers can view their orders');
      setLoading(false);
      return;
    }

    fetchOrders();
    console.log("this is the order", orders);
  }, [isLoggedIn, user, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (!token || !user.id) {
        throw new Error('Authentication token or user ID not found');
      }

      const response = await fetch('http://localhost:5001/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const responseData = await response.json();
      // Assuming responseData is an object with an 'orders' property
      setOrders(responseData.orders);
      console.log("Orders set:", responseData.orders);

    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderExpanded = (orderId: string) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'PROCESSING':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'SHIPPED':
        return <Truck className="h-5 w-5 text-purple-500" />;
      case 'DELIVERED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'CANCELLED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        <p className="mt-4 text-lg">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p className="mt-2 text-gray-600">{error}</p>
        <Button 
          className="mt-6 bg-black text-white hover:bg-gray-800"
          onClick={() => router.push('/')}
        >
          Return to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
          <Button 
            className="bg-black text-white hover:bg-gray-800"
            onClick={() => router.push('/')}
          >
            Start Shopping
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div 
              key={order.id} 
              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Order header */}
              <div className="bg-gray-50 p-4 sm:px-6 border-b">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Order ID: <span className="font-mono">{order.id}</span></p>
                    <p className="text-sm text-gray-500">Placed on: {formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <span className="font-medium">
                      Status: {order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-700 font-medium">Total: ${order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              
              {/* Order summary - always visible */}
              <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 cursor-pointer" onClick={() => toggleOrderExpanded(order.id)}>
                <div className="flex items-center gap-4">
                  {/* Show first product image as thumbnail */}
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded overflow-hidden">
                    {order.items[0]?.product.imageUrl ? (
                      <img 
                        src={order.items[0].product.imageUrl} 
                        alt={order.items[0].product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder-product.png"; // Fallback image
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <p className="font-medium">{order.items[0]?.product.name}</p>
                    <p className="text-sm text-gray-500">
                      From {order.items[0]?.product.store.name} 
                      {order.items.length > 1 && ` + ${order.items.length - 1} more item(s)`}
                    </p>
                  </div>
                </div>
                
                <button 
                  className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-black"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOrderExpanded(order.id);
                  }}
                >
                  {expandedOrders[order.id] ? (
                    <>Hide Details <ChevronUp className="h-4 w-4" /></>
                  ) : (
                    <>View Details <ChevronDown className="h-4 w-4" /></>
                  )}
                </button>
              </div>
              
              {/* Order details - expanded view */}
              {expandedOrders[order.id] && (
                <div className="border-t p-4 sm:p-6 bg-gray-50">
                  <h3 className="font-medium mb-4">Order Items</h3>
                  
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-3 bg-white rounded-lg border">
                        {/* Product image */}
                        <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded overflow-hidden">
                          {item.product.imageUrl ? (
                            <img 
                              src={item.product.imageUrl} 
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder-product.png"; // Fallback image
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        {/* Product details */}
                        <div className="flex-grow">
                          <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                            <div>
                              <h4 className="font-medium">{item.product.name}</h4>
                              <p className="text-sm text-gray-500">From {item.product.store.name}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">${item.price.toFixed(2)} × {item.quantity}</p>
                              <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {item.product.description}
                          </p>
                          
                          <div className="mt-3">
                            <Link href={`/productDetail-page?id=${item.product.id}`} passHref>
                              <Button variant="outline" size="sm" className="text-xs">
                                View Product
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}