"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingCart, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/lib/CartContext";
import Cart from "@/components/cart";

export default function ProductDetailPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  // Keep the API port as a constant in case it needs to be changed later
  const API_PORT = "5001";

  useEffect(() => {
    if (!id) {
      setError("Product ID not found");
      setIsLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        
        // Fetch product details
        const productUrl = `http://localhost:${API_PORT}/api/products/${id}`;
        const productResponse = await fetch(productUrl);
        
        if (!productResponse.ok) {
          const errorText = await productResponse.text();
          console.error(`API error: ${productResponse.status}`, errorText);
          throw new Error(`Failed to load product: ${productResponse.statusText} (${productResponse.status})`);
        }
        
        const productData = await productResponse.json();
        setProduct(productData);
        
        // For similar products
        if (productData.category) {
          const similarUrl = `http://localhost:${API_PORT}/api/products?category=${productData.category}&limit=3`;
          const similarResponse = await fetch(similarUrl);
          
          if (similarResponse.ok) {
            const similarData = await similarResponse.json();
            
            // Check if similarData has products property (depends on your API structure)
            const similarProducts = similarData.products || similarData;
            
            // Filter out the current product from similar products if it's included
            setSimilarProducts(
              Array.isArray(similarProducts) 
                ? similarProducts.filter((p: any) => p.id !== id)
                : []
            );
          }
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err instanceof Error ? err.message : "Failed to load product details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const increase = () => setQuantity((prev) => prev + 1);
  const decrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    if (!product) return;
    
    // Add to cart using the context
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      imageUrl: product.imageUrl
    });
    
    // Show cart after adding item
    setIsCartOpen(true);
  };

  const goBack = () => {
    router.back();
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <p className="text-red-500 text-xl mb-2">Failed to load product details</p>
      {error && (
        <p className="text-gray-600 text-sm mb-4 max-w-lg text-center">
          Error: {error}
        </p>
      )}
      <p className="text-gray-500 text-sm mb-6 max-w-lg text-center">
        Please make sure the backend server is running and the product ID exists.
      </p>
      <Button onClick={goBack} className="mt-2">Go Back</Button>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen py-12 relative overflow-x-hidden">
      <div className="container mx-auto px-4 lg:px-12">
        {/* Back button */}
        <button
          onClick={goBack}
          className="mb-6 flex items-center text-gray-600 hover:text-black"
        >
          <ArrowLeft className="mr-2" size={20} /> Back to products
        </button>

        <div className="bg-white shadow-md rounded-lg flex flex-col md:flex-row gap-12 items-center p-8">
          <div className="w-full md:w-1/2">
            <div className="relative w-full h-96">
              <Image
                src={product.imageUrl || "/product-placeholder.jpg"}
                alt={product.name}
                fill
                className="object-cover rounded-md"
              />
            </div>
          </div>

          <div className="w-full md:w-1/2 flex flex-col gap-6">
            <h2 className="text-4xl font-bold">{product.name}</h2>
            <p className="text-gray-600 text-xl">
              Farmer: <span className="font-semibold">{product.farmer || "Unknown Farmer"}</span>
            </p>
            <p className="text-xl text-gray-600">{product.description || "No description available."}</p>
            <p className="text-3xl font-bold text-green-600">${product.price?.toFixed(2)}</p>
            
            {/* only show add to cart button when it's not a Farmer */}
            {(user?.role !== "FARMER") && ( 
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={decrease}>
                <Minus className="w-4 h-4" />
              </Button>
              <input
                type="number"
                value={quantity}
                readOnly
                className="w-16 h-10 text-center rounded-md border border-gray-300 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <Button variant="outline" size="icon" onClick={increase}>
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleAddToCart}
                className="px-4 py-2 bg-black text-white hover:bg-black/80 flex items-center gap-2"
              >
                <ShoppingCart size={16} /> ADD TO CART
              </Button>
            </div>
            )}
          </div>
        </div>

        {similarProducts.length > 0 && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6">Similar Products</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {similarProducts.map((similar) => (
                <div 
                  key={similar.id} 
                  className="bg-white p-4 shadow rounded-lg flex flex-col items-center cursor-pointer hover:shadow-xl transition-shadow"
                  onClick={() => router.push(`/productDetail-page?id=${similar.id}`)}
                >
                  <Image
                    src={similar.imageUrl || "/product-placeholder.jpg"}
                    alt={similar.name}
                    width={200}
                    height={200}
                    className="object-cover rounded-md mb-4"
                  />
                  <h4 className="text-xl font-semibold mb-2">{similar.name}</h4>
                  <p className="text-green-600 font-bold">${similar.price?.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Shopping Cart Sidebar */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}