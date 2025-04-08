"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { handleRedirectAfterAuth } from '@/lib/navigation';//跳转到farmer or customer

// Define form schema
const formSchema = z.object({
  accountType: z.string().min(1, { message: "Please select an account type" }),
  userName: z.string().min(2, { message: "Username must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string(),
  address: z.string().optional(),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const { login } = useAuth();

  // Create a form instance
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountType: "",
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
      address: "",
      phone: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Reset error and success states
    setApiError(null);
    setRegistrationSuccess(false);
    setEmailExists(false);
    setIsLoading(true);
    
    try {
      // Prepare the data according to the API documentation
      const userData = {
        email: values.email,
        password: values.password,
        name: values.userName,
        phone: values.phone || '',
        address: values.address || '',
        role: values.accountType.toUpperCase(), // Convert to uppercase as per API format
      };
      
      // Send registration request to API
      const response = await fetch("http://localhost:5001/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (response.ok) {  // registration is successful
        console.log("Registration successful:", data);
        setRegistrationSuccess(true);
        
        // Use the auth context to set logged in status
        // Login with the returned user data and token
        login(data.user, data.token);
        
        // Store user data and token in sessionStorage for session persistence
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect to home page after successful registration
        // setTimeout(() => {
        //   router.push('/');
        // }, 2000);
        setTimeout(() => {
          handleRedirectAfterAuth(data.user, router);
        }, 2000);       
      } else {  // registration failed
        console.error("Registration failed:", data.message);
        
        // Check if the error is about email already existing
        if (data.message.includes("Email is already registered")) {
          setEmailExists(true);
        } else {
          setApiError(data.message || "Registration failed. Please try again.");
        }
      }
      
    } catch (error) {
      console.error("Error during registration:", error);
      setApiError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const goToLandingPage = () => {
    router.push('/');
  };

  return (
    <>
      <Head>
        <title>Create Your Account | Fresh Harvest</title>
        <meta name="description" content="Join our community of farmers and food enthusiasts. Register for Fresh Harvest today." />
      </Head>
      <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-12">
          <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-xl font-bold text-black md:text-2xl md:font-bold lg:text-3xl lg:font-bold">Create Your Account</h1>
                <p className="mt-2 text-sm text-gray-600 md:text-base max-w-2xl mx-auto">
                Join our community of farmers and food enthusiasts. Register for Fresh Harvest today.
                </p>
              </div>

              {/* Email Exists Alert */}
              {emailExists && (
                <div className="mb-4 p-4 bg-amber-100 border border-amber-400 text-amber-700 rounded flex flex-col items-center">
                  <div className="flex items-center mb-2">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <span className="font-medium">This email is already registered!</span>
                  </div>
                  <p className="mb-3 text-center">
                    It looks like you already have an account. Would you like to login instead?
                  </p>
                  <Button 
                    onClick={() => router.push('/login-page')}
                    className="bg-amber-600 text-white hover:bg-amber-700"
                  >
                    Go to Login Page
                  </Button>
                </div>
              )}

              {/* API Error Message */}
              {apiError && !emailExists && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span> {apiError} </span>
                </div>
              )}

              {/* Success Message */}
              {registrationSuccess && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span>Registration successful! Redirecting to home page...</span>
                </div>
              )}

              <div className="p-8 bg-[#A4B494]/30 rounded-lg shadow-xl">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="flex flex-col justify-center px-10">
                      <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                              <FormField
                                  control={form.control}
                                  name="accountType"
                                  render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Account Type</FormLabel>
                                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                                              <FormControl>
                                                  <SelectTrigger className="w-full bg-white border border-gray-300 rounded-md shadow-sm hover:shadow-md transition-shadow focus:ring-1 focus:ring-green-500 focus:border-green-500">
                                                      <SelectValue placeholder="Choose your account type" />
                                                  </SelectTrigger>
                                              </FormControl>
                                              <SelectContent>
                                                  <SelectGroup>
                                                      <SelectItem value="CUSTOMER">Customer</SelectItem>
                                                      <SelectItem value="FARMER">Farmer</SelectItem>
                                                  </SelectGroup>
                                              </SelectContent>
                                          </Select>
                                          <FormMessage className="text-red-500 text-sm mt-1" />
                                      </FormItem>
                                  )}
                              />

                              <FormField
                                  control={form.control}
                                  name="userName"
                                  render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Username</FormLabel>
                                          <FormControl>
                                              <input 
                                                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 shadow-sm hover:shadow-md transition-shadow" 
                                                  placeholder="Enter your username" 
                                                  {...field} 
                                              />
                                          </FormControl>
                                          <FormMessage className="text-red-500 text-sm mt-1" />
                                      </FormItem>
                                  )}
                              />

                              <FormField
                                  control={form.control}
                                  name="email"
                                  render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Email</FormLabel>
                                          <FormControl>
                                              <input 
                                                  type="email"
                                                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 shadow-sm hover:shadow-md transition-shadow" 
                                                  placeholder="example@email.com" 
                                                  {...field} 
                                              />
                                          </FormControl>
                                          <FormMessage className="text-red-500 text-sm mt-1" />
                                      </FormItem>
                                  )}
                              />

                              <FormField
                                  control={form.control}
                                  name="phone"
                                  render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Phone (Optional)</FormLabel>
                                          <FormControl>
                                              <input 
                                                  type="tel"
                                                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 shadow-sm hover:shadow-md transition-shadow" 
                                                  placeholder="Phone number" 
                                                  {...field} 
                                              />
                                          </FormControl>
                                          <FormMessage className="text-red-500 text-sm mt-1" />
                                      </FormItem>
                                  )}
                              />

                              <FormField
                                  control={form.control}
                                  name="address"
                                  render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Address (Optional)</FormLabel>
                                          <FormControl>
                                              <input 
                                                  type="text"
                                                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 shadow-sm hover:shadow-md transition-shadow" 
                                                  placeholder="Your address" 
                                                  {...field} 
                                              />
                                          </FormControl>
                                          <FormMessage className="text-red-500 text-sm mt-1" />
                                      </FormItem>
                                  )}
                              />

                              <FormField
                                  control={form.control}
                                  name="password"
                                  render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Password</FormLabel>
                                          <FormControl>
                                              <div className="relative">
                                                  <input 
                                                      type={showPassword ? "text" : "password"}
                                                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 shadow-sm hover:shadow-md transition-shadow" 
                                                      placeholder="*************" 
                                                      {...field} 
                                                  />
                                                  <button 
                                                      type="button"
                                                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                      onClick={() => setShowPassword(!showPassword)}
                                                  >
                                                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                  </button>
                                              </div>
                                          </FormControl>
                                          <FormMessage className="text-red-500 text-sm mt-1" />
                                      </FormItem>
                                  )}
                              />

                              <FormField
                                  control={form.control}
                                  name="confirmPassword"
                                  render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Confirm Password</FormLabel>
                                          <FormControl>
                                              <div className="relative">
                                                  <input 
                                                      type={showConfirmPassword ? "text" : "password"}
                                                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 shadow-sm hover:shadow-md transition-shadow" 
                                                      placeholder="*************" 
                                                      {...field} 
                                                  />
                                                  <button 
                                                      type="button"
                                                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                  >
                                                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                  </button>
                                              </div>
                                          </FormControl>
                                          <FormMessage className="text-red-500 text-sm mt-1" />
                                      </FormItem>
                                  )}
                              />

                              <div className="space-y-4 pt-4">
                                  <div className="flex items-start">
                                      <input
                                          id="terms"
                                          name="terms"
                                          type="checkbox"
                                          className="h-4 w-4 text-green-500 focus:ring-1 focus:ring-green-500 border-gray-300 rounded mt-1 shadow-sm"
                                      />
                                      <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                                          By creating an account, you agree to our Terms & Conditions
                                      </label>
                                  </div>
                              </div>

                              <div className="flex justify-center mt-6">
                                  <Button 
                                      type="submit" 
                                      className="w-1/2 bg-green-600 text-white font-bold hover:bg-green-600/30 shadow-md hover:shadow-lg transition-shadow"
                                      disabled={isLoading}
                                  >
                                      {isLoading ? 'Registering...' : 'Register'}
                                  </Button>
                              </div>
                          </form>
                      </Form>
                      </div>

                      <div className="hidden lg:flex items-center justify-center">
                          <div className="w-full max-w-md">
                              <img 
                                  src="/register-img.jpeg" 
                                  alt="Registration illustration" 
                                  className="w-full h-auto rounded-lg shadow-lg"
                              />
                          </div>
                      </div>
                  </div>
              </div>
          </div>
    </div>
    </>
  );
}


