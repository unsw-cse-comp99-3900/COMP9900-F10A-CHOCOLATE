"use client";

import { useEffect, useState } from "react";
import { useParams, notFound, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { ArrowLeft } from "lucide-react";

export default function OrderReceiptPage() {
  const params = useParams();
  const orderId = params?.id as string;
  const { isLoggedIn, token, user } = useAuth();
  const router = useRouter();
  
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const goBack = () => {
    // If user is a farmer, go to farmer orders page, otherwise go to customer orders page
    if (user?.role === "FARMER") {
      router.push("/farmer-orders");
    } else {
      router.push("/order-page");
    }
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!isLoggedIn || !token || !orderId) {
        setError("Authentication required");
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (!res.ok) {
          if (res.status === 404) {
            notFound();
          }
          setError("Failed to fetch order details");
          setIsLoading(false);
          return;
        }

        const orderData = await res.json();
        setOrder(orderData);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("An error occurred while fetching order details");
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [isLoggedIn, token, orderId]);

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

  if (!order) return null;

  // 统计订单中所有商品数量（若需要）
  const totalQuantity = order.items.reduce(
    (acc: number, item: any) => acc + item.quantity,
    0
  );

  return (
    <div className="container mx-auto p-4">
      {/* Back button */}
      <button
        onClick={goBack}
        className="mb-6 flex items-center text-gray-600 hover:text-black"
      >
        <ArrowLeft className="mr-2" size={20} /> Back to Orders
      </button>

      {/* Store information - getting from the first item in the order */}
      <div className="mb-6">
        <h2 className="font-bold text-lg">
          {order.items[0]?.product.store?.name || "Store Name"}
        </h2>
        <p>
          {order.items[0]?.product.store?.address || "Store Address not available"}
        </p>
      </div>

      {/* Receipt basic information */}
      <div className="flex flex-col md:flex-row md:justify-between mb-6">
        <div className="space-y-1">
          <p className="font-semibold">Ship To:</p>
          <p>{order.customer.address || "Shipping address not provided"}</p>
        </div>
        <div className="text-right space-y-1 mt-4 md:mt-0">
          <p>Receipt #{order.id}</p>
          <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
          <p>Time: {new Date(order.createdAt).toLocaleTimeString()}</p>
          <p className="font-bold">Total: ${order.totalAmount.toFixed(2)}</p>
        </div>
      </div>

      {/* Order items table */}
      <table className="w-full border-collapse mb-8">
        <thead>
          <tr className="border-b border-black">
            <th className="pb-2 text-left">QTY</th>
            <th className="pb-2 text-left">DESCRIPTION</th>
            <th className="pb-2 text-left">UNIT PRICE</th>
            <th className="pb-2 text-left">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item: any) => (
            <tr key={item.id} className="border-b border-gray-300">
              <td className="py-3">{item.quantity}</td>
              <td className="py-3">{item.product.name}</td>
              <td className="py-3">${item.price.toFixed(2)}</td>
              <td className="py-3">${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total and payment info */}
      <div className="text-right mb-8">
        <p>Subtotal: ${order.totalAmount.toFixed(2)}</p>
      </div>
      <div className="space-y-2 mb-8">
        <p>BSB Number: 123-456</p>
        <p>Account Number: 987654321</p>
        <p>Payment due within 15 days.</p>
        <p>Thank you for your business!</p>
      </div>
    </div>
  );
}
