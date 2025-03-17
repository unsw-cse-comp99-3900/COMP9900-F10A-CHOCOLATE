"use client";

import { useEffect, useState } from "react";
import Filter from "@/components/ui/filter";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string>("");
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;

  useEffect(() => {
    params.then(({ slug }) => {
      setSlug(decodeURIComponent(slug)); // Decode URL
    });
  }, [params]);

  let bannerText = slug === "shop" ? "SHOP" : slug;

  // Sample product data (Replace with API data)
  const products = Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    name: `Product ${i + 1}`,
    farmer: `Farmer: ABC`,
    price: `$${(Math.random() * 10 + 2).toFixed(2)}`,
    image: "https://via.placeholder.com/150",
  }));

  // Section mapping for navigation - maps slug to the home page section IDs
  const sectionMapping: Record<string, string> = {
    shop: "#home",
    Fruit: "#categories",
    Veggie: "#categories",
    Wheat: "#categories",
    "Sugar cane": "#categories",
    Lentils: "#categories",
  };

  const handleGoBack = () => {
    // Get the target section for this slug
    const targetSection = sectionMapping[slug] || "";
    
    // Navigate to homepage with the section ID
    router.push(`/${targetSection}`);
  };

  const categories = [
    { name: "All Products", count: 961 },
    { name: "Fruit", count: 14, expandable: true },
    { name: "Veggie", count: 146, expandable: true },
    { name: "Wheat", count: 117 },
    { name: "Sugar Cane", count: 59 },
    { name: "Lentils", count: 5 },
  ];

  const handleFilterChange = (filters: { category: string; priceRange: number[] }) => {
    console.log("Selected Filters:", filters);
    // Fetch products based on filters (to be implemented)
  };

  // Pagination Logic: Get Products for Current Page
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const paginatedProducts = products.slice(startIndex, endIndex);
  const totalPages = Math.ceil(products.length / productsPerPage);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Banner Section */}
      <section className="relative text-center py-20 h-[300px] flex items-center justify-center shadow-lg overflow-hidden w-full">
        <div className="flex items-center gap-4">
          {/* Arrow Button */}
          <button
            onClick={handleGoBack}
            className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-full hover:bg-gray-800 transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          {/* Category Text */}
          <h1 className="text-6xl font-extrabold drop-shadow-lg">{bannerText}</h1>
        </div>
      </section>

      {/* Main Content Area with Filter (Left) and Product Grid (Right) */}
      <section className="container mx-auto px-6 py-10 flex flex-col md:flex-row md:justify-between">
        {/* Filter Sidebar (Left Side) */}
        <div className="w-full md:w-1/4 md:mr-6">
          <Filter categories={categories} onFilterChange={handleFilterChange} />
        </div>

        {/* Product Listing (Right Side) */}
        <div className="flex-1 bg-white p-6 shadow rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Product Listing</h2>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedProducts.map((product) => (
              <div key={product.id} className="bg-white p-4 rounded-lg shadow border">
                <div className="w-full h-40 bg-gray-200 flex items-center justify-center rounded-md">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-md" />
                </div>
                <h3 className="text-md font-semibold mt-2">{product.name}</h3>
                <p className="text-gray-600 text-sm">{product.farmer}</p>
                <p className="text-lg font-bold mt-1">{product.price}</p>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 border rounded-md ${
                  currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"
                }`}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 border rounded-md ${
                    currentPage === i + 1 ? "bg-black text-white" : "hover:bg-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 border rounded-md ${
                  currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}