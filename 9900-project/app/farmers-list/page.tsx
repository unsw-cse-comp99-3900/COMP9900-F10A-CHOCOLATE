"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function FarmersList() {
  const router = useRouter();
  const [farmers, setFarmers] = useState<{ id: string; name: string; image: string; description: string; rating: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const farmersPerPage = 8;

  useEffect(() => {
    async function fetchFarmers() {
      try {
        const response = await fetch("http://localhost:5001/api/stores");
        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("API did not return an array");
        }

        const formattedFarmers = data.map(store => ({
          id: store.owner?.id || "unknown",
          name: store.owner?.name || "Unknown Farmer",
          image: store.imageUrl || "/farmer1.jpg",
          description: store.description || "No description available",
          rating: store.rating || 0
        }));

        setFarmers(formattedFarmers);
      } catch (error) {
        console.error("Failed to fetch farmers:", error);
        setError("Failed to load farmers");
      } finally {
        setLoading(false);
      }
    }

    fetchFarmers();
  }, []);

  // 计算分页
  const indexOfLastFarmer = currentPage * farmersPerPage;
  const indexOfFirstFarmer = indexOfLastFarmer - farmersPerPage;
  const currentFarmers = farmers.slice(indexOfFirstFarmer, indexOfLastFarmer);
  const totalPages = Math.ceil(farmers.length / farmersPerPage);

  const handleGoBack = () => {
    router.push("/#farmers");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-xl">Loading farmers...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-xl text-red-500">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Section */}
      <section className="relative text-center py-20 flex items-center justify-center w-full bg-white">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handleGoBack}
              className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-full hover:bg-gray-800 transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-6xl font-extrabold text-black">Our Farmers</h1>
          </div>
          <p className="text-xl text-gray-600">Meet the dedicated farmers who bring fresh produce to your table</p>
        </div>
      </section>

      {/* Farmers Grid */}
      <section className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {currentFarmers.map((farmer) => (
            <div key={farmer.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <Link href={`/farmer-page/${encodeURIComponent(farmer.id)}`} className="block">
                <div className="relative h-48">
                  <Image
                    src={farmer.image}
                    alt={farmer.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{farmer.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{farmer.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="ml-1">{farmer.rating.toFixed(1)}</span>
                    </div>
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12 gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i}
                variant={currentPage === i + 1 ? "default" : "outline"}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </section>
    </div>
  );
} 