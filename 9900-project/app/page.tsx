"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  const [farmers, setFarmers] = useState<{ id: string; name: string; image: string; description: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFarmers() {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5001/api/stores");
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();

        // Handle non-array responses gracefully
        if (!Array.isArray(data)) {
          console.error("API did not return an array:", data);
          setFarmers([]);
          setError("Could not load farmers. Please check if the backend server is running.");
          return;
        }

        const formattedFarmers = data.slice(0, 4).map(store => ({
          id: store.owner?.id || "unknown",
          name: store.owner?.name || "Unknown Farmer",
          image: store.imageUrl || "/farmer1.jpg",
          description: store.description || "No description available"
        }));

        setFarmers(formattedFarmers);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch farmers:", error);
        setError("Failed to connect to API server. Please check if the backend is running.");
        setFarmers([]);
      } finally {
        setLoading(false);
      }
    }

    fetchFarmers();
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const id = hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
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
            <div className="hidden sm:block w-24 h-px bg-gray-600 transform -rotate-3 translate-y-1" />
            <h2 className="mx-4 text-4xl font-extrabold tracking-wide">Categories</h2>
            <div className="hidden sm:block w-24 h-px bg-gray-600 transform rotate-3 translate-y-1" />
          </div>
          <p className="mt-4 text-gray-600">
            Explore our award-winning range of fresh fruit, vegetables, wheat, sugar cane <br className="hidden md:block" />
            and lentils and more.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 col-span-2">
            {[{ name: 'Fruit', image: '/fruit.jpg' },
              { name: 'Veggie', image: '/veggie.jpg' },
              { name: 'Wheat', image: '/wheat.jpg' },
              { name: 'Sugar_cane', image: '/sugar-cane.jpg' }
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
            Meet our top farmers, dedicated to bringing you the freshest, highest-quality produce <br className="hidden md:block" />
            straight from the farm.
          </p>
          <Link href="/farmers-list" className="inline-block mt-2 text-blue-600 hover:text-blue-800 transition-colors">
            View All Farmers →
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading farmers...</p>
        ) : error ? (
          <div>
            <p className="text-red-500">{error}</p>
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Show placeholders instead */}
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="group relative h-80 block overflow-hidden rounded-lg shadow-lg bg-gray-200">
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                    <h3 className="text-4xl font-bold">Farmer {i}</h3>
                    <p className="mt-1 text-sm font-normal">Farmer data unavailable</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {farmers.map((farmer) => (
              <div key={farmer.id} className="group relative h-80 block overflow-hidden rounded-lg shadow-lg">
                <Link href={`/farmer-page/${encodeURIComponent(farmer.id)}`} className="group relative block overflow-hidden w-full h-full">
                  <Image
                    src={farmer.image}
                    alt={farmer.name}
                    fill
                    className="object-cover group-hover:scale-110 transition"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white">
                    <h3 className="text-4xl font-bold">{farmer.name}</h3>
                    <p className="mt-1 text-sm font-normal">{farmer.description}</p>
                    <Button className="mt-4 bg-white/70 text-black px-4 py-2 rounded-md shadow-md hover:bg-white/80 transition cursor-pointer">
                      MEET FARMER
                    </Button>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}