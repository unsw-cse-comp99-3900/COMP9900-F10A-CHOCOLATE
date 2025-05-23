
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

const formSchema = z.object({
  storeName: z.string().min(2, "Store name must be at least 2 characters").max(50, "Store name must be less than 50 characters"),
  storeDescription: z.string().min(10, "Description must be at least 10 characters").max(500, "Description must be less than 500 characters"),
  storeImage: z.any().optional(), // use file instead of URL
});

export default function CreateStore() {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("/default-store-bg.jpg");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      storeName: "",
      storeDescription: "",
      storeImage: undefined,
    },
  });

  useEffect(() => {
    if (!user) {
      setError("You must be logged in to create a store");
      return;
    }
    if (user.role !== "FARMER") {
      setError("Only farmers can create stores");
      return;
    }
  }, [user]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || user.role !== "FARMER") {
      alert("You must be logged in as a farmer to create a store");
      router.push("/login-page");
      return;
    }

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      alert("Authentication token not found. Please log in again.");
      router.push("/login-page");
      return;
    }

    const formData = new FormData();
    formData.append("name", values.storeName);
    formData.append("description", values.storeDescription);
    if (values.storeImage) {
      formData.append("image", values.storeImage);
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/stores`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create store');
      }

      const data = await response.json();
      alert("Store created successfully!");
      router.push("/landing_famer_store");
    } catch (error) {
      console.error("Error creating store:", error);
      setError(error instanceof Error ? error.message : "Failed to create store");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (error && (error === "You must be logged in to create a store" || error === "Only farmers can create stores")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={() => router.push("/login-page")}>
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-10">
      <div className="w-full max-w-[80%] bg-white rounded-lg shadow-md p-8 md:max-w-[65%] lg:max-w-[60%] xl:max-w-[50%]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Your Store</h1>
          <p className="text-gray-600">Start selling your farm products by creating your store</p>
        </div>

        {error && <div className="text-red-500 mb-4 p-3 bg-red-50 rounded">{error}</div>}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="storeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Name</FormLabel>
                  <FormControl>
                    <Input className="w-full" placeholder="This is how customers will identify your store..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="storeDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      className="w-full h-[120px] resize-none" 
                      placeholder="Tell customers about your store and products..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="storeImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        field.onChange(file);
                        if (file) {
                          const previewUrl = URL.createObjectURL(file);
                          setImagePreview(previewUrl);
                        }
                      }}
                    />
                  </FormControl>
                  {imagePreview && (
                    <div className="mt-2">
                      <p className="text-sm font-medium mb-1">Image Preview:</p>
                      <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-md" />
                    </div>
                  )}
                  <FormDescription>Upload a store banner image from your device</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-center pt-4">
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating Store..." : "Create Store"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
