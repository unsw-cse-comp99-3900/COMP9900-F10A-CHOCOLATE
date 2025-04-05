"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";

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
  productName: z.string().min(2).max(50),
  productDescription: z.string().min(2).max(2000),
  productPrice: z.string().min(1).max(100),
  productQuantity: z.string().min(1).max(100),
  productImage: z.string().min(2).max(100),
  productCategory: z.string().min(2).max(50),
});

export default function UploadProduct() {
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

  function onSubmit(values: z.infer<typeof formSchema>) {
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
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
            name="productDescription"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Product Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                    <SelectTrigger className="w-full bg-white border border-gray-300 rounded-md shadow-sm hover:shadow-md transition-shadow focus:ring-1 focus:ring-green-500 focus:border-green-500">
                    <SelectValue placeholder="Choose your account type" />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    <SelectGroup>
                    <SelectItem value="FRUIT">Fruit</SelectItem>
                    <SelectItem value="VEGGIE">Veggie</SelectItem>
                    <SelectItem value="WHEAT">Wheat</SelectItem>
                    <SelectItem value="SUGER CANE">Suger Cane</SelectItem>
                    <SelectItem value="LENTILES">lentiles</SelectItem>
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
                <FormLabel>Product Image</FormLabel>
                <FormControl>
                  <Input className="w-full" type="file" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
    
          <div className="flex justify-center">
            <Button type="submit" className="w-1/2">Submit</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
