"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/AuthContext";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  productName: z.string().min(2, "Product name must be at least 2 characters").max(50, "Product name must be less than 50 characters"),
  productDescription: z.string().min(2, "Description must be at least 2 characters").max(2000, "Description must be less than 2000 characters"),
  productPrice: z.string().min(1, "Price is required"),
  productQuantity: z.string().min(1, "Quantity is required"),
  productImage: z.string().optional(),
  productCategory: z.string().min(2, "Category is required"),
});

function EditProductContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productData, setProductData] = useState<any>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Define form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        productName: "",
        productDescription: "",
        productPrice: "",
        productQuantity: "",
        productImage: "",
        productCategory: "",
    },
  });

  // Fetch product data when component mounts
  useEffect(() => {
    if (!productId) {
      setError("Product ID is missing");
      setIsLoading(false);
      return;
    }

    async function fetchProductData() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/products/${productId}`);
        if (!response.ok) throw new Error("Failed to fetch product");
        
        const product = await response.json();
        setProductData(product);
        setStoreId(product.storeId);
        
        // Populate form with product data
        form.reset({
          productName: product.name,
          productDescription: product.description || "",
          productPrice: product.price.toString(),
          productQuantity: product.quantity.toString(),
          productImage: product.imageUrl || "",
          productCategory: product.category,
        });
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product information");
      } finally {
        setIsLoading(false);
      }
    }
    fetchProductData();
  }, [productId, form]);

  // Fetch the farmer's store data
  useEffect(() => {
    async function fetchStoreData() {
      if (!user || user.role !== "FARMER") {
        setError("You must be logged in as a farmer to edit products");
        return;
      }

      if (storeId) return; // Skip if we already have storeId from product data

      try {
        const response = await fetch("http://localhost:5001/api/stores");
        if (!response.ok) throw new Error("Failed to fetch stores");
        
        const stores = await response.json();
        const userStore = stores.find((s: any) => s.ownerId === user.id);
        
        if (!userStore) {
          setError("You don't have a store yet. Please create a store first.");
        } else {
          setStoreId(userStore.id);
        }
      } catch (err) {
        console.error("Error fetching store:", err);
        if (!storeId) {
          setError("Failed to load your store information");
        }
      }
    }

    if (!storeId && !isLoading) {
      fetchStoreData();
    }
  }, [user, storeId, isLoading]);

  // Add delete product function
  const handleDeleteProduct = async () => {
    if (!productId) {
      alert("Product ID is missing");
      return;
    }

    // Confirm deletion
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    if (!token) {
      alert("Authentication token not found. Please log in again.");
      router.push("/login-page");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete product');
      }

      setSuccess("Product deleted successfully!");
      // Redirect to the farmer's store page after a short delay
      setTimeout(() => {
        router.push('/landing_famer_store');
      }, 1500);
    } catch (error) {
      console.error("Error deleting product:", error);
      alert(error instanceof Error ? error.message : "Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!productId) {
      alert("Product ID is missing");
      return;
    }
    
    // Get token from storage
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (!token) {
      alert("Authentication token not found. Please log in again.");
      router.push("/login-page");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: values.productName,
          description: values.productDescription,
          price: parseFloat(values.productPrice),
          quantity: parseInt(values.productQuantity),
          imageUrl: values.productImage || '/default-product.jpg', // Default image if none provided
          category: values.productCategory,
        }),
      });

      if (!response.ok) { // if the response is not ok, throw an error
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update product');
      }

      const data = await response.json();

      setSuccess("Product updated successfully!");
      // Redirect to the farmer's store page
      router.push(`/landing_famer_store`);
    } catch (error) {
      console.error("Error updating product:", error);
      alert(error instanceof Error ? error.message : "Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading product information...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={() => router.push("/landing_famer_store")}>
          Back to Store
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-220 py-[100px]">
      {success && <div className="text-green-500 mb-4">{success}</div>}
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full max-w-[85%] md:max-w-[65%] lg:max-w-[50%] xl:max-w-[40%]">
          <FormField
            control={form.control}
            name="productName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input className="w-full" placeholder="Enter product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        <FormField
            control={form.control}
            name="productCategory"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Product Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                    <SelectTrigger className="w-full bg-white border border-gray-300 rounded-md shadow-sm hover:shadow-md transition-shadow focus:ring-1 focus:ring-green-500 focus:border-green-500">
                    <SelectValue placeholder="Choose product category" />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    <SelectGroup>
                    <SelectItem value="FRUIT">Fruit</SelectItem>
                    <SelectItem value="VEGGIE">Veggie</SelectItem>
                    <SelectItem value="WHEAT">Wheat</SelectItem>
                    <SelectItem value="SUGAR_CANE">Sugar Cane</SelectItem>
                    <SelectItem value="LENTILS">Lentils</SelectItem>
                    </SelectGroup>
                </SelectContent>
                </Select>
                <FormMessage className="text-red-500 text-sm mt-1" />
            </FormItem>
            )}
            />

        <FormField
            control={form.control}
            name="productDescription"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Product Description</FormLabel>
                <FormControl>
                    <Textarea 
                    className="w-full h-[100px] resize-none" 
                    placeholder="Enter product description..." 
                    {...field} 
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />

          <FormField
            control={form.control}
            name="productPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Price</FormLabel>
                <FormControl>
                  <Input className="w-full" type="number" placeholder="Enter product price" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="productQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Quantity</FormLabel>
                <FormControl>
                  <Input className="w-full" type="number" placeholder="Enter product quantity" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="productImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Image URL</FormLabel>
                <FormControl>
                  <Input className="w-full" type="text" placeholder="Enter image URL or upload path" {...field} />
                </FormControl>
                <FormDescription>
                  Enter an image URL or upload path for your product
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Image Preview */}
          {form.watch("productImage") && (
            <div className="mt-2 border rounded-md p-2">
              <p className="text-sm font-medium mb-2">Image Preview:</p>
              <div className="relative h-40 w-full overflow-hidden rounded-md">
                <img
                  src={form.watch("productImage") || "/default-product.jpg"}
                  alt="Product Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/default-product.jpg";
                  }}
                />
              </div>
            </div>
          )}
    
          <div className="flex justify-between gap-4">
            <Button 
              type="button" 
              className="w-1/3" 
              variant="outline"
              onClick={() => router.push("/landing_famer_store")}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              className="w-1/3 bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteProduct}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
            <Button 
              type="submit" 
              className="w-1/3 bg-green-600 hover:bg-green-700 text-white" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

// Main edit product page component
export default function EditProductPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditProductContent />
    </Suspense>
  );
}
