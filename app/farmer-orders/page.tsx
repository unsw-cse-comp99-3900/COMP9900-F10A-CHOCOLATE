"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";

export default function FarmerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isLoggedIn, token, user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isLoggedIn || !token || user?.role !== "FARMER") {
        setError("You need to be logged in as a farmer to view orders");
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        
        if (!res.ok) {
          console.error("Failed to fetch orders");
          setError("Failed to fetch orders. Please try again later.");
          setIsLoading(false);
          return;
        }
        
        const data = await res.json();
        setOrders(data.orders || data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("An error occurred while fetching orders");
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [isLoggedIn, token, user]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-center text-3xl font-bold mb-4">My Farm Orders</h1>
      
      {orders.length > 0 ? (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-black">
              <th className="py-2 text-left">Order ID</th>
              <th className="py-2 text-left">Customer Name</th>
              <th className="py-2 text-left">Order Date</th>
              <th className="py-2 text-left">Order Amount</th>
              <th className="py-2 text-left">Status</th>
              <th className="py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-gray-300">
                <td className="py-2">{order.id.substring(0, 8)}...</td>
                <td className="py-2">
                  {order.customer?.name || order.customer?.email || "Unknown Customer"}
                </td>
                <td className="py-2">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="py-2">${order.totalAmount?.toFixed(2) || "0.00"}</td>
                <td className="py-2">{getStatusText(order.status)}</td>
                <td className="py-2">
                  <Link href={`/order-page/receipt/${order.id}`}>
                    <button className="border border-black px-3 py-1 uppercase text-sm hover:bg-gray-100">
                      Check
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-xl text-gray-600">No Orders Yet</p>
          <p className="mt-2 text-gray-500">Orders will appear here when customers purchase your products</p>
        </div>
      )}
    </div>
  );
}

function getStatusText(status: string) {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "PROCESSING":
      return "Processing";
    case "SHIPPED":
      return "Shipped";
    case "DELIVERED":
      return "Delivered";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
} 