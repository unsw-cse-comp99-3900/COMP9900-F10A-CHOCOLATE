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

// Define form schema
const formSchema = z.object({
  accountType: z.string().min(1, { message: "Please select an account type" }),
  fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
})

export default function RegisterPage() {
  // Create a form instance
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountType: "",
      fullName: "",
      email: "",
      password: "",
    },
  });

  const [accountType, setAccountType] = useState("");

  function onSubmit(values: z.infer<typeof formSchema>) {
    // This will be type-safe and validated
    console.log(values);
    // Handle form submission
  }
 
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-black md:text-2xl md:font-bold lg:text-3xl lg:font-bold">REGISTER MY ACCOUNT</h1>
            <p className="mt-2 text-sm text-black">
                Our advanced analytics help organizations and candidates make faster recruitment decisions
            </p>
            </div>

            <div className="p-8 bg-[#A4B494]/30 rounded-lg shadow-xl">
                <h2 className="text-2xl font-bold text-black mb-8 text-center">REGISTER</h2>
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
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </form>
                    </Form>
                    </div>

                    <div className="hidden lg:flex items-center justify-center">
                        <div className="w-full max-w-md">
                            <img 
                                src="https://placehold.co/400x400/A4B494/ffffff?text=Register" 
                                alt="Registration illustration" 
                                className="w-full h-auto rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}


