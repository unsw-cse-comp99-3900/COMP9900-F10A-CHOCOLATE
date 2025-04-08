"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PackageOpen } from "lucide-react";
import FilterSidebar from "@/components/ui/filter"; // 引入 FilterSidebar 组件

export default function LandingFarmerNoStorePage() {
  const router = useRouter();

  // 处理跳转
  const handleClick = (page: string) => {
    router.push(page); // 跳转到指定页面
  };

  // 筛选器状态
  const [filters, setFilters] = useState({
    category: "All Products", // 默认选中 "所有产品"
    priceRange: [0, 150], // 默认价格范围
  });

  // 筛选器类别数据，所有类别的计数都为 0
  const categories = [
    { name: "All Products", count: 0 },
    { name: "Fruit", count: 0 },
    { name: "Veggie", count: 0 },
    { name: "Wheat", count: 0 },
    { name: "Sugar Cane", count: 0 },
    { name: "Lentils", count: 0 },
  ];

  // 处理筛选器变化
  const handleFilterChange = (newFilters: { category: string; priceRange: number[] }) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* hero section */}
      <button
        onClick={() => handleClick("/Create-Store")}
        className="relative h-[350px] w-full flex items-center justify-center bg-gray-200 bg-cover bg-center cursor-pointer"
      >
        <div className="absolute inset-0 bg-black/40" /> {/* 模糊遮罩层 */}
        <div className="relative text-center text-white z-10 flex flex-col items-center justify-center">
          <h1 className="text-5xl font-extrabold mb-4 leading-relaxed">You don't have a store yet!</h1>
          <p className="text-4xl font-medium mb-4 leading-relaxed">Create one now</p>
        </div>
      </button>

      {/* 筛选器部分 */}
      <section className="container mx-auto px-6 py-10 flex flex-col md:flex-row gap-6">
        {/* Filter Sidebar */}
        <div className="md:w-1/4">
            <FilterSidebar categories={categories} onFilterChange={handleFilterChange} />
        </div>

        {/* 没有产品的展示部分，竖直排列 */}
        <div className="flex flex-col items-center justify-center flex-1">
            <h2 className="text-2xl font-semibold mb-4">OOPs, there is nothing here :(</h2>
            <button
                onClick={() => handleClick("/Create-Store")} // 触发跳转
                className="mt-6 flex justify-center items-center p-4 rounded-full cursor-pointer"
                >
                <PackageOpen size={200} className="text-gray-500" /> {/* 设置图标颜色为灰色 */}
            </button>
            <p className="mt-4 text-lg">Create your store to start selling products!</p>
        </div>
      </section>
    </div>
  );
}
