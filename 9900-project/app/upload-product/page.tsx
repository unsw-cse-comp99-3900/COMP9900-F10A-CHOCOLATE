"use client";

import { useState, useEffect, ChangeEvent } from "react";
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
  productCategory: z.string().min(2, "Category is required"),
});

export default function UploadProduct() {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Define form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        productName: "",
        productDescription: "",
        productPrice: "",
        productQuantity: "",
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
        setError("Failed to load your store information");
      } finally {
        setIsLoading(false);
      }
    }

    fetchStoreData();
  }, [user]);

  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result as string);
      };
      fileReader.readAsDataURL(file);
      setUploadStatus(null); // Reset upload status when a new file is selected
    } else {
      setPreviewUrl(null);
    }
  };

  // Handle file upload
  const uploadImage = async (): Promise<string | null> => {
    if (!selectedFile) return null;
    
    setUploadStatus("Uploading...");
    
    try {
      // Get token from storage
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const formData = new FormData();
      formData.append('image', selectedFile);
      // Add the token to the form data instead of headers
      formData.append('token', token);
      
      console.log("Starting file upload for:", selectedFile.name);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/upload`, {
        method: 'POST',
        // Don't set Content-Type header for FormData, browser will set it with boundary
        body: formData,
      });
      
      console.log("Upload response status:", response.status);
      
      if (!response.ok) {
        let errorMessage = 'Failed to upload image';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error("Could not parse error response:", e);
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      setUploadStatus("Upload successful!");
      console.log("File upload response:", data);
      return data.fileName; // Return the file name saved on the server
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploadStatus("Upload failed. Please try again.");
      return null;
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Check if user is logged in and has a store
    if (!user || user.role !== "FARMER") {
      alert("You must be logged in as a farmer to upload products");
      router.push("/login-page");
      return;
    }

    if (!storeId) {
      alert("You don't have a store yet. Please create a store first.");
      router.push("/account/store");
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
      console.log("Starting product submission with image:", selectedFile ? selectedFile.name : "No file selected");
      
      // Upload image first if a file is selected
      let imageFileName = '/default-product.jpg'; // Default image
      
      if (selectedFile) {
        console.log("Attempting to upload file:", selectedFile.name);
        const uploadedFileName = await uploadImage();
        console.log("Upload result:", uploadedFileName);
        
        if (uploadedFileName) {
          imageFileName = uploadedFileName; // Don't add leading slash, it's already in the fileName from server
          console.log("Image file name set to:", imageFileName);
        } else {
          console.warn("File upload failed, using default image");
        }
      } else {
        console.log("No file selected, using default image");
      }

      console.log("Preparing to create product with image:", imageFileName);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/products`, {
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
          imageUrl: '/'+imageFileName, 
          category: values.productCategory,
          storeId: storeId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create product');
      }

      const data = await response.json();
      console.log("Product created successfully:", data);
      
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
        <Button onClick={() => router.push("/account/store")}>
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

          <div className="space-y-4">
            <div>
              <FormLabel htmlFor="productImage">Product Image</FormLabel>
              <div className="mt-1 flex items-center">
                <Input
                  id="productImage"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full"
                />
              </div>
              {uploadStatus && (
                <p className={`text-sm mt-1 ${uploadStatus.includes('failed') ? 'text-red-500' : 'text-green-500'}`}>
                  {uploadStatus}
                </p>
              )}
              <FormDescription>
                Select an image file for your product (JPG, PNG, etc.)
              </FormDescription>
            </div>
            
            {previewUrl && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Preview:</p>
                <div className="relative w-full h-48 border border-gray-200 rounded-md overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Product preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>
    
          <div className="flex justify-center">
            <Button type="submit" className="w-1/2 mb-10" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
