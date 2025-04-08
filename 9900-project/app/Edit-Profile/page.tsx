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
import Image from "next/image";

// Extend the User interface to include additional fields
interface ExtendedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
}

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// User profile schema
const userProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
  phone: z.string().optional(),
  address: z.string().optional(),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine(data => !data.password || data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Store schema (only for farmers)
const storeProfileSchema = z.object({
  storeName: z.string().min(2, "Store name must be at least 2 characters").max(50, "Store name must be less than 50 characters"),
  storeDescription: z.string().min(10, "Description must be at least 10 characters").max(500, "Description must be less than 500 characters"),
  storeImageUrl: z.string().optional(),
});

export default function EditProfile() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [store, setStore] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string>("/default-store-bg.jpg");
  const [imageError, setImageError] = useState(false);

  // User form
  const userForm = useForm<z.infer<typeof userProfileSchema>>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Store form (for farmers)
  const storeForm = useForm<z.infer<typeof storeProfileSchema>>({
    resolver: zodResolver(storeProfileSchema),
    defaultValues: {
      storeName: "",
      storeDescription: "",
      storeImageUrl: "",
    },
  });

  // Watch for changes in the image URL field
  const storeImageUrl = storeForm.watch("storeImageUrl");
  
  // Update image preview when URL changes
  useEffect(() => {
    if (storeImageUrl && storeImageUrl.trim() !== "") {
      setImagePreview(storeImageUrl);
      setImageError(false); // Reset error state when URL changes
    } else if (store?.imageUrl) {
      setImagePreview(store.imageUrl);
      setImageError(false);
    } else {
      setImagePreview("/default-store-bg.jpg");
      setImageError(false);
    }
  }, [storeImageUrl, store]);

  // Handle image load error
  const handleImageError = () => {
    setImageError(true);
    setImagePreview("/default-store-bg.jpg");
  };

  // Fetch user and store data
  useEffect(() => {
    if (!user) {
      setError("You must be logged in to edit your profile");
      setIsLoading(false);
      return;
    }

    // Load user data into form
    userForm.reset({
      name: user.name || "",
      phone: (user as any).phone || "",
      address: (user as any).address || "",
      password: "",
      confirmPassword: "",
    });

    // If user is a farmer, fetch store data
    if (user.role === "FARMER") {
      fetchStoreData();
    } else {
      setIsLoading(false);
    }

    async function fetchStoreData() {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
          throw new Error("Authentication token not found");
        }

        const response = await fetch("http://localhost:5001/api/stores");
        if (!response.ok) throw new Error("Failed to fetch stores");
        
        const stores = await response.json();
        if (!user) return; // Safety check if user becomes null
        
        const userStore = stores.find((s: any) => s.ownerId === user.id);
        
        if (userStore) {
          setStore(userStore);
          storeForm.reset({
            storeName: userStore.name || "",
            storeDescription: userStore.description || "",
            storeImageUrl: userStore.imageUrl || "",
          });
          setImagePreview(userStore.imageUrl || "/default-store-bg.jpg");
        }
      } catch (err) {
        console.error("Error fetching store:", err);
        setError("Failed to load your store information");
      } finally {
        setIsLoading(false);
      }
    }
  }, [user, userForm, storeForm]);

  // Update user profile
  async function onUserSubmit(values: z.infer<typeof userProfileSchema>) {
    if (!user) {
      setError("You must be logged in to update your profile");
      return;
    }
    
    // Get token from storage
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (!token) {
      setError("Authentication token not found. Please log in again.");
      router.push("/login-page");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Prepare data (only include fields that are not empty)
      const updateData: any = {};
      if (values.name) updateData.name = values.name;
      if (values.phone) updateData.phone = values.phone;
      if (values.address) updateData.address = values.address;
      if (values.password) updateData.password = values.password;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      
      // Update user in storage to reflect changes
      if (localStorage.getItem('token')) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else if (sessionStorage.getItem('token')) {
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      // Show success message
      setSuccess("Profile updated successfully!");
      
      // Instead of reloading which might lose auth state,
      // redirect to a specific page after a short delay
      setTimeout(() => {
        if (user.role === "FARMER") {
          router.push("/landing_famer_store");
        } else {
          router.push("/");
        }
      }, 1500);
      
      // Reset password fields
      userForm.setValue("password", "");
      userForm.setValue("confirmPassword", "");
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Update store details (for farmers)
  async function onStoreSubmit(values: z.infer<typeof storeProfileSchema>) {
    if (!user || user.role !== "FARMER") {
      setError("You must be logged in as a farmer to update store details");
      return;
    }
    
    if (!store) {
      setError("You need to create a store first");
      return;
    }
    
    // Get token from storage
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (!token) {
      setError("Authentication token not found. Please log in again.");
      router.push("/login-page");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/stores/${store.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: values.storeName,
          description: values.storeDescription,
          imageUrl: values.storeImageUrl || '/default-store-bg.jpg',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update store details');
      }

      const updatedStore = await response.json();
      setStore(updatedStore);
      setSuccess("Store details updated successfully!");
      
      // Redirect to the farmer landing page after a short delay instead of reloading
      setTimeout(() => {
        router.push("/landing_famer_store");
      }, 1500);
    } catch (error) {
      console.error("Error updating store:", error);
      setError(error instanceof Error ? error.message : "Failed to update store details");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading your profile information...</div>;
  }

  if (error && error === "You must be logged in to edit your profile") {
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
    <div className="flex flex-col items-center justify-center min-h-screen py-10">
      <div className="w-full max-w-[90%] md:max-w-[80%] lg:max-w-[70%] xl:max-w-[60%]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <p className="text-gray-600">Update your personal information</p>
        </div>

        {error && <div className="text-red-500 mb-4 p-3 bg-red-50 rounded">{error}</div>}
        {success && <div className="text-green-500 mb-4 p-3 bg-green-50 rounded">{success}</div>}

        {/* User Profile Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          
          <Form {...userForm}>
            <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-6">
              <FormField
                control={userForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input className="w-full" placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={userForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input className="w-full" placeholder="Your phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={userForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input className="w-full" placeholder="Your address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={userForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" className="w-full" placeholder="Leave blank to keep current password" {...field} />
                      </FormControl>
                      <FormDescription>
                        Leave blank if you don't want to change your password
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={userForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" className="w-full" placeholder="Confirm your new password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <Button 
                onClick={() => router.push("/landing_famer_store")}
                className="w-full bg-black text-white hover:bg-black/80 hover:cursor-pointer py-3"
              >
                Back to Store
              </Button>

              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating Profile..." : "Update Profile"}
              </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Store Information Section (Only for Farmers) */}
        {user?.role === "FARMER" && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-xl font-semibold mb-4">Store Information</h2>
            
            {!store ? (
              <div className="text-center py-6">
                <p className="text-gray-600 mb-4">You don't have a store yet.</p>
                <Button 
                  onClick={() => router.push("/Create-Store")}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Create a Store
                </Button>
              </div>
            ) : (
              <Form {...storeForm}>
                <form onSubmit={storeForm.handleSubmit(onStoreSubmit)} className="space-y-6">
                  <FormField
                    control={storeForm.control}
                    name="storeName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store Name</FormLabel>
                        <FormControl>
                          <Input className="w-full" placeholder="Your store name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={storeForm.control}
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
                    control={storeForm.control}
                    name="storeImageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store Banner Image URL</FormLabel>
                        <FormControl>
                          <Input 
                            className="w-full" 
                            type="text" 
                            placeholder="https://example.com/your-store-image.jpg" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          An image URL for your store banner. URLs from image services like Unsplash or stock photo sites are supported.
                          {imageError && <span className="text-red-500 ml-2">Image URL is invalid. Using default image.</span>}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Image Preview */}
                  <div className="mt-4 border rounded-md p-2">
                    <p className="text-sm font-medium mb-2">Banner Preview:</p>
                    <div className="relative h-48 w-full overflow-hidden rounded-md">
                      <img
                        src={imagePreview}
                        alt="Store Banner Preview"
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                      />
                    </div>
                  </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                 <Button
                  onClick={() => router.push("/landing_famer_store")}
                  className="w-full bg-black text-white hover:bg-black/80 hover:cursor-pointer py-3"
                 >
                  Back to Store
                 </Button>

                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700 hover:cursor-pointer  text-white py-3" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Updating Store..." : "Update Store"}
                  </Button>
                </div>
                </form>
              </Form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
