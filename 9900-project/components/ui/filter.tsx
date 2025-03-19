"use client";

import React, { useState } from "react";
import * as Slider from "@radix-ui/react-slider";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface Category {
  name: string;
  count: number;
  expandable?: boolean;
}

interface FilterSidebarProps {
  categories: Category[];
  onFilterChange: (filters: { category: string; priceRange: number[] }) => void;
}

export default function FilterSidebar({ categories, onFilterChange }: FilterSidebarProps) {
  const [priceRange, setPriceRange] = useState([0, 150]); // Default price range
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Handle price slider movement
  const handleSliderChange = (value: number[]) => {
    setPriceRange(value);
  };

  // Handle category selection
  const selectCategory = (category: string) => {
    setSelectedCategory(category);
  };

  // Toggle expandable categories
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  // Apply selected filters
  const applyFilter = () => {
    onFilterChange({ category: selectedCategory || "All", priceRange });
  };

  return (
    <div className="w-full p-4 space-y-6 border-r bg-white rounded-md">
      {/* Filter by Price */}
      <div>
        <h3 className="text-lg font-bold">FILTER BY PRICE</h3>
        <Slider.Root
          className="relative flex items-center w-full h-6"
          value={priceRange}
          onValueChange={handleSliderChange}
          min={0}
          max={150}
          step={5}
        >
          <Slider.Track className="relative w-full h-1 bg-gray-300 rounded" />
          <Slider.Range className="absolute h-1 bg-black rounded" />
          <Slider.Thumb className="block w-4 h-4 bg-black rounded-full" />
          <Slider.Thumb className="block w-4 h-4 bg-black rounded-full" />
        </Slider.Root>
        <p className="mt-2 text-sm text-gray-700">
          Price: <strong>${priceRange[0]}</strong> — <strong>${priceRange[1]}</strong>
        </p>
      </div>

      {/* Product Categories */}
      <div>
        <h3 className="text-lg font-bold">PRODUCT CATEGORIES</h3>
        <ul className="space-y-2">
          {categories.map((category) => (
            <li
              key={category.name}
              className={`flex items-center justify-between cursor-pointer p-2 rounded-md ${
                selectedCategory === category.name ? "bg-black text-white" : "hover:bg-gray-200"
              }`}
              onClick={() => selectCategory(category.name)}
            >
              <span>{category.name}</span>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 text-xs font-semibold bg-gray-200 rounded">
                  {category.count}
                </span>
                {category.expandable && (
                  <button onClick={(e) => {
                    e.stopPropagation(); // Prevent selecting category on expand click
                    toggleCategory(category.name);
                  }}>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        expandedCategories.includes(category.name) ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Button className="w-full mt-2 bg-black text-white" onClick={applyFilter}>
        APPLY FILTER
      </Button>
    </div>
  );
}
