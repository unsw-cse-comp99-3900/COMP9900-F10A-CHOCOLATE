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
import { Eye, EyeOff } from "lucide-react"
import Head from 'next/head';

// Define form schema
const formSchema = z.object({
  accountType: z.string().min(1, { message: "Please select an account type" }),
  userName: z.string().min(2, { message: "Username must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function RegisterPage() {
  // Create a form instance
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountType: "",
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function onSubmit(values: z.infer<typeof formSchema>) {
    // This will be type-safe and validated
    console.log(values);
    // Handle form submission
  }
 
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
                                                  <SelectTrigger className="w-full bg-white border-black rounded-md">
                                                      <SelectValue placeholder="Choose your account type" />
                                                  </SelectTrigger>
                                              </FormControl>
                                              <SelectContent>
                                                  <SelectGroup>
                                                      <SelectItem value="Customer">Customer</SelectItem>
                                                      <SelectItem value="Farmer">Farmer</SelectItem>
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
                                                  className="flex h-10 w-full rounded-md border border-black bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A4B494]" 
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
                                                  className="flex h-10 w-full rounded-md border border-black bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A4B494]" 
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
                                                      className="flex h-10 w-full rounded-md border border-black bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A4B494]" 
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
                                                      className="flex h-10 w-full rounded-md border border-black bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A4B494]" 
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
                                          className="h-4 w-4 text-[#A4B494] focus:ring-[#A4B494] border-gray-300 rounded mt-1"
                                      />
                                      <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                                          By creating an account, you agree to our Terms & Conditions
                                      </label>
                                  </div>
                              </div>

                              <div className="flex justify-center mt-6">
                                  <Button type="submit" className="w-1/2 bg-green-600 text-white font-bold hover:bg-green-600/30">
                                      Register
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
                                  className="w-full h-auto rounded-lg"
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


