"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

export default function UploadProduct() {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Define form
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

  // Fetch the farmer's store data
  useEffect(() => {
    async function fetchStoreData() {
      setIsLoading(true);
      
      if (!user || user.role !== "FARMER") {
        setError("You must be logged in as a farmer to upload products");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stores`);
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API error: ${response.status}`, errorText);
          throw new Error(`Failed to fetch stores: ${response.statusText}`);
        }
        
        const stores = await response.json();
        const userStore = stores.find((s: any) => s.ownerId === user.id);
        
        if (!userStore) {
          setError("You don't have a store yet. Please create a store first.");
        } else {
          setStoreId(userStore.id);
        }
      } catch (err) {
        console.error("Error fetching store:", err);
        setError("Failed to load your store information");
      } finally {
        setIsLoading(false);
      }
    }

    fetchStoreData();
  }, [user]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Check if user is logged in and has a store
    if (!user || user.role !== "FARMER") {
      alert("You must be logged in as a farmer to upload products");
      router.push("/login-page");
      return;
    }

    if (!storeId) {
      alert("You don't have a store yet. Please create a store first.");
      router.push("/Create-Store");
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: values.productName,
          description: values.productDescription,
          price: parseFloat(values.productPrice),
          quantity: parseInt(values.productQuantity),
          imageUrl: values.productImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80', // 使用Unsplash上的一张图片
          category: values.productCategory,
          storeId: storeId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create product');
      }

      const data = await response.json();
      
      alert("Product created successfully!");

      // Redirect to the farmer's store page
      router.push(`/landing_famer_store`);
    } catch (error) {
      console.error("Error creating product:", error);
      alert(error instanceof Error ? error.message : "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading your store information...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={() => router.push("/Create-Store")}>
          Create a Store
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-220">
      <h1 className="text-2xl font-bold mb-4">Upload Product</h1>
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
                  Enter an image URL for your product (e.g., https://example.com/image.jpg)
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
                  src={form.watch("productImage") || "/placeholder-product.png"}
                  alt="Product Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.onerror = null; // 防止无限循环
                    target.src = "/placeholder-product.png";
                  }}
                />
              </div>
            </div>
          )}
    
          <div className="flex justify-center">
            <Button type="submit" className="w-1/2" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
