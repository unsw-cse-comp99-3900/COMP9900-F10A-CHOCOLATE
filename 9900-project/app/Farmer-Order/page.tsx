// app/order-page/page.tsx
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function OrderPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isLoggedIn, token, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  // 检查是否是从支付成功页面跳转过来的
  const fromPayment = useRef(searchParams.has('fromPayment'));
  // Add a ref to track if we've already fetched orders
  const hasFetchedRef = useRef(false);
  // Add a ref to track the last fetch time
  const lastFetchTimeRef = useRef(0);
  // Minimum time between fetches (10 seconds)
  const minFetchInterval = 10000;

  const fetchOrders = useCallback(async (force = false) => {
    // 如果是强制刷新或者从支付页面过来，则忽略时间间隔限制
    if (!force && !fromPayment.current) {
      // Check if enough time has passed since last fetch to prevent excessive calls
      const now = Date.now();
      if (now - lastFetchTimeRef.current < minFetchInterval && hasFetchedRef.current) {
        return;
      }
    }
    
    if (!isLoggedIn || !token) {
      setError("Please log in to view your orders");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      // Update the last fetch time
      lastFetchTimeRef.current = Date.now();
      // Set hasFetched to true
      hasFetchedRef.current = true;
      // 从支付页面来的标记重置
      fromPayment.current = false;
      
      // 确保每次都获取最新数据，添加时间戳和随机数防止缓存
      const timestamp = Date.now();
      const randomParam = Math.random().toString(36).substring(7);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders?t=${timestamp}&r=${randomParam}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      
      if (!res.ok) {
        console.error("Failed to fetch orders");
        setError("Failed to fetch orders. Please try again later.");
        setIsLoading(false);
        return;
      }
      
      const data = await res.json();
      console.log("Orders fetched:", data); // Debug log
      setOrders(data.orders || data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("An error occurred while fetching orders");
      setIsLoading(false);
    }
  }, [isLoggedIn, token]);

  // Initial fetch only once, or force refresh if coming from payment page
  useEffect(() => {
    if (!hasFetchedRef.current || fromPayment.current) {
      fetchOrders(fromPayment.current);
    }
  }, [fetchOrders]);

  // Add a limited refresh effect when page is focused
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        if (now - lastFetchTimeRef.current >= minFetchInterval) {
          fetchOrders();
        }
      }
    };

    // Set up event listeners for page visibility and focus
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Use a less frequent refresh interval (30 seconds instead of 5)
    const intervalId = setInterval(() => {
      const now = Date.now();
      if (now - lastFetchTimeRef.current >= minFetchInterval) {
        fetchOrders();
      }
    }, 30000);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, [fetchOrders]);

  // Add refresh button
  const handleRefresh = () => {
    setIsLoading(true);
    // Force a refresh regardless of time interval when manually requested
    lastFetchTimeRef.current = 0;
    fetchOrders(true);
  };

  // If user is not logged in, show login button
  if (!isLoggedIn) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Please log in to view your orders</p>
        </div>
        <Button 
          onClick={() => router.push("/login-page")}
          className="mt-4 bg-green-600 hover:bg-green-700 text-white"
        >
          Go to Login
        </Button>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-center text-3xl font-bold">My Orders</h1>
        <Button 
          onClick={handleRefresh}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Refresh Orders
        </Button>
      </div>
      
      {orders.length > 0 ? (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-black">
              <th className="py-2 text-left">Customer Name</th>
              <th className="py-2 text-left">Order Date</th>
              <th className="py-2 text-left">Time</th>
              <th className="py-2 text-left">Quantity</th>
              <th className="py-2 text-left">Total Price</th>
              <th className="py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              // 计算订单中所有商品的总数量
              const totalQuantity = order.items?.reduce(
                (acc: number, item: any) => acc + item.quantity,
                0
              ) || 0;
              return (
                <tr key={order.id} className="border-b border-gray-300">
                  <td className="py-2">
                    {order.customer?.name || order.customer?.email || "Unknown"}
                  </td>
                  <td className="py-2">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2">
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="py-2">{totalQuantity}</td>
                  <td className="py-2">${order.totalAmount?.toFixed(2) || "0.00"}</td>
                  <td className="py-2">
                    {/*<Link href={`/order-page/receipt/${order.id}`}>*/}
                
                    <button className="border border-black px-3 py-1 uppercase text-sm hover:bg-gray-100">
                    Check
                    </button>
                
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-xl text-gray-600">No orders found</p>
          <p className="mt-2 text-gray-500">Your order history will appear here once you make a purchase</p>
        </div>
      )}
    </div>
  );
}