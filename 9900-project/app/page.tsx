"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  // Add this effect to handle scrolling to sections based on hash
  useEffect(() => {
    // Get the hash from the URL (e.g., #categories)
    const hash = window.location.hash;
    
    if (hash) {
      // Remove the # symbol to get the ID
      const id = hash.substring(1);
      
      // Find the element with that ID
      const element = document.getElementById(id);
      
      // If the element exists, scroll to it
      if (element) {
        // Small delay to ensure the page is fully loaded
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Banner Section */}
      <header id="home" className="relative text-center py-20 h-[700px] flex flex-col items-center justify-center shadow-lg overflow-hidden w-full">
        <div className="absolute inset-0 w-full h-full">
        <Image
          src="/main-banner-background-small.jpg"
          alt="Fresh Food Market"
          fill                 
          priority            
          className="block lg:hidden object-cover"       
        />
        <Image
          src="/main-banner-background-large.jpg"
          alt="Fresh Food Market"
          fill
          priority
          className="hidden lg:block object-cover"
        />
        </div>
        <div className="relative z-10 text-white text-center px-6 md:px-12 bg-transparent">
          <h1 className="text-6xl font-extrabold drop-shadow-lg">Your Local <br /> FRESH FOOD MARKET</h1>
          <Link href="/product-page/shop">
            <Button className="mt-6 bg-white/70 text-black px-6 py-3 rounded-md shadow-md hover:bg-white/80 transition cursor-pointer">SHOP NOW</Button>
          </Link>
        </div>
      </header>

      {/* Categories Section */}
      <section id="categories" className="text-center mt-20 px-16 max-w-screen-xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {/* left line */}
            <div className="hidden sm:block w-24 h-px bg-gray-600 transform -rotate-3 translate-y-1" />
            <h2 className="mx-4 text-4xl font-extrabold tracking-wide">Categories</h2>
            {/* right line */}
            <div className="hidden sm:block w-24 h-px bg-gray-600 transform rotate-3 translate-y-1" />
          </div>
          <p className="mt-4 text-gray-600">
            Explore our award-winning range of fresh fruit, vegetables, meats <br className="hidden md:block"/>
            and grazing platters and more.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 col-span-2">
            {[{ name: 'Fruit', image: '/fruit.jpg' },
              { name: 'Veggie', image: '/veggie.jpg' },
              { name: 'Wheat', image: '/wheat.jpg' },
              { name: 'Sugar cane', image: '/sugar-cane.jpg' }
            ].map((category) => (
              <div key={category.name} className="relative h-64 overflow-hidden rounded-lg shadow-lg">
                <Link href={`/product-page/${category.name}`} className="group relative h-64 block overflow-hidden rounded-lg shadow-lg">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition"
                    sizes="100vw"
                  />
                  <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white">
                    <h3 className="text-5xl font-bold">{category.name}</h3>
                    <Button className="mt-4 bg-white/70 text-black px-4 py-2 rounded-md shadow-md hover:bg-white/80 transition cursor-pointer">
                      SHOP NOW
                    </Button>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 col-span-2">
            {[{ name: 'Lentils', image: '/lentils.jpg' }].map((category) => (
              <div key={category.name} className="relative h-64 overflow-hidden rounded-lg shadow-lg col-span-2">
                <Link href={`/product-page/${category.name}`} className="group relative h-64 block overflow-hidden rounded-lg shadow-lg">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition"
                    sizes="100vw"
                  />
                  <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white">
                    <h3 className="text-5xl font-bold">{category.name}</h3>
                    <Button className="mt-4 bg-white/70 text-black px-4 py-2 rounded-md shadow-md hover:bg-white/80 transition cursor-pointer">
                      SHOP NOW
                    </Button>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Farmers Section */}
      <section id="farmers" className="text-center py-20 px-16 bg-gray-100 max-w-screen-xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="hidden sm:block w-24 h-px bg-gray-600 transform -rotate-3 translate-y-1" />
            <h2 className="mx-4 text-4xl font-extrabold tracking-wide">Top Farmers</h2>
            <div className="hidden sm:block w-24 h-px bg-gray-600 transform rotate-3 translate-y-1" />
          </div>
          <p className="mt-4 text-gray-600">
            Meet our top farmers, dedicated to bringing you the freshest, highest-quality produce <br className="hidden md:block"/>
            straight from the farm
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {[
            { name: 'Farmer1', image: '/farmer.png', slogan: 'Farm fresh every day!' },
            { name: 'Farmer2', image: '/farmer.png', slogan: 'Quality you can taste.' },
            { name: 'Farmer3', image: '/farmer.png', slogan: 'Bringing nature to your plate.' },
            { name: 'Farmer4', image: '/farmer.png', slogan: 'Sustainably grown, locally known.' },
          ].map((farmer) => (
            <div 
              key={farmer.name} 
              className="group relative h-80 block overflow-hidden rounded-lg shadow-lg"
            >
              <Link href={`/farmer-page/${farmer.name}`} className="group relative block overflow-hidden w-full h-full">
                <Image
                  src={farmer.image}
                  alt={farmer.name}
                  fill
                  className="object-cover group-hover:scale-110 transition"
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white">
                  <h3 className="text-4xl font-bold">{farmer.name}</h3>
                  <p className="mt-1 text-sm font-normal">{farmer.slogan}</p>
                  <Button className="mt-4 bg-white/70 text-black px-4 py-2 rounded-md shadow-md hover:bg-white/80 transition cursor-pointer">
                    MEET FARMER
                  </Button>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}