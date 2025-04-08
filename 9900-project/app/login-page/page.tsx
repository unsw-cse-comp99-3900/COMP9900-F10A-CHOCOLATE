"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
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
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [invalidCredentials, setInvalidCredentials] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Create a form instance
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountType: "",
      email: "",
      password: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Reset error and success states
    setLoginError(null);
    setInvalidCredentials(false);
    setLoginSuccess(false);
    setIsLoading(true);

    try {
      // Prepare login data
      const loginData = {
        email: values.email,
        password: values.password,
        role: values.accountType.toUpperCase()
      };
      
      // Send login request to API
      const response = await fetch("http://localhost:5001/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log("Login successful:", data);
        setLoginSuccess(true);
        
        // Use the auth context to set logged in status
        login(data.user, data.token);
        
        // Store token and user data
        if (rememberMe) {
          // Store in localStorage for persistent login
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          // Store in sessionStorage for session-only login
          sessionStorage.setItem('token', data.token);
          sessionStorage.setItem('user', JSON.stringify(data.user));
        }
        
        // Redirect to home page after successful login
        // setTimeout(() => {
        //   router.push('/');
        // }, 1500);
        setTimeout(() => {
          handleRedirectAfterAuth(data.user, router);
        }, 1500);        
      } else {
        console.error("Login failed:", data.message);
          setInvalidCredentials(true);
      
      }
    } catch (error) {
      console.error("Error during login:", error);
      setLoginError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Sign In | Fresh Harvest</title>
        <meta name="description" content="Sign in to your Fresh Harvest account to access your profile and start shopping." />
      </Head>
      <div className="min-h-180 bg-white py-8 px-4 sm:px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-black md:text-2xl md:font-bold lg:text-3xl lg:font-bold">Sign In to Your Account</h1>
            <p className="mt-2 text-sm text-gray-600 md:text-base max-w-2xl mx-auto">
              Welcome back! Sign in to access your account and continue your fresh food journey.
            </p>
          </div>

          {/* Invalid Credentials Alert */}
          {invalidCredentials && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded flex flex-col items-center">
              <div className="flex items-center mb-2">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span className="font-medium">Invalid account information! Please check your email, password and account type.</span>
              </div>
            </div>
          )}

          {/* Other Error Message */}
          {loginError && !invalidCredentials && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Success Message */}
          {loginSuccess && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>Login successful! Redirecting to home page...</span>
            </div>
          )}

          <div className="p-6 bg-[#A4B494]/30 rounded-lg shadow-xl mb-6">
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

                    <div className="flex items-center justify-between">
                      <div className="flex items-start">
                        <input
                          id="remember-me"
                          name="remember-me"
                          type="checkbox"
                          checked={rememberMe}
                          onChange={() => setRememberMe(!rememberMe)}
                          className="h-4 w-4 text-green-500 focus:ring-1 focus:ring-green-500 border-gray-300 rounded mt-1 shadow-sm"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                          Remember me
                        </label>
                      </div>

                    </div>

                    <div className="flex justify-center mt-6">
                      <Button 
                        type="submit" 
                        className="w-1/2 bg-green-600 text-white font-bold hover:bg-green-600/30 shadow-md hover:shadow-lg transition-shadow"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Signing In...' : 'Sign In'}
                      </Button>
                    </div>

                    <div className="text-center mt-4">
                      <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link href="/register-page" className="font-medium text-green-600 hover:text-green-500">
                          Register here
                        </Link>
                      </p>
                    </div>
                  </form>
                </Form>
              </div>

              <div className="hidden lg:flex items-center justify-center">
                <div className="w-full max-w-md">
                  <img 
                    src="/login.png" 
                    alt="Login illustration" 
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