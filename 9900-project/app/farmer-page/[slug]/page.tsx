"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Filter from "@/components/ui/filter";

export default function FarmerPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;

  const [farmer, setFarmer] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;

  useEffect(() => {
    if (!slug) return;

    async function fetchFarmerData() {
      try {
        console.log("Fetching data for farmer with ID:", slug);
        const response = await fetch("http://localhost:5001/api/stores");
        if (!response.ok) throw new Error("Failed to fetch farmers");
        const stores = await response.json();

        const store = stores.find((store: any) => store.owner.id === slug);
        if (!store) throw new Error(`Farmer with ID '${slug}' not found in stores data`);

        setFarmer({
          id: store.owner.id,
          name: store.owner.name,
          image: store.imageUrl || `/farmer${store.owner.id}.jpg`,
          description: store.description || "No description available",
          rating: store.rating || 0,
        });

        const productsData = store.products || [];
        setProducts(productsData);
        setFilteredProducts(productsData);
      } catch (error: any) {
        console.error("Error fetching farmer data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchFarmerData();
  }, [slug]);

  const categoryMap = filteredProducts.reduce<Record<string, number>>((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {});

  const categoriesArray = Object.entries(categoryMap).map(([name, count]) => ({
    name,
    count,
  }));

  const handleFilterChange = (filters: { category: string; priceRange: number[] }) => {
    console.log("Selected Filters:", filters);
    const filtered = products.filter((product) => {
      const isCategoryMatch =
        filters.category === "All Products" || product.category === filters.category;
      const isPriceMatch =
        product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];
      return isCategoryMatch && isPriceMatch;
    });

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const startIndex = (currentPage - 1) * productsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Section */}
      <section className="relative text-center py-20 flex items-center justify-center w-full bg-white">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handleGoBack}
              className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-full hover:bg-gray-800 transition cursor-pointer"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-6xl font-extrabold text-black">{farmer.name}</h1>
          </div>
          <p className="text-xl text-gray-600">High-quality fresh products from Fresh Market 1</p>
        </div>
      </section>

      {/* Farmer Profile Section */}
      <section className="container mx-auto px-6 py-10">
        <div className="bg-white p-6 shadow rounded-lg mb-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="w-64 h-64 relative rounded-lg overflow-hidden">
              <img src={farmer.imageUrl || '/store-placeholder.jpg'}  alt={farmer.name} className="object-cover w-full h-full" />
            </div>
            <div className="flex-1 space-y-4">
              <h2 className="text-4xl font-extrabold text-gray-900">{farmer.name}</h2>
              <div className="border-t border-gray-300 w-24 my-2"></div>
              <p className="text-lg text-gray-600 leading-relaxed py-6">{farmer.description}</p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-gray-700">⭐ Rating:</span>
                  <span className="text-lg text-yellow-500 font-bold">{farmer.rating}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-gray-700">🛒 Total Products:</span>
                  <span className="text-lg text-gray-900">{products.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content: Filter + Product Grid */}
        <section className="flex flex-col md:flex-row md:justify-between">
          {/* Filter Sidebar */}
          <div className="w-full md:w-1/4 md:mr-6">
            <Filter
              categories={[{ name: "All Products", count: products.length }, ...categoriesArray]}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Product Grid */}
          <div className="flex-1 bg-white p-6 shadow rounded-lg">
            <h2 className="text-2xl font-semibold mb-6">Products from {farmer.name}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white p-4 rounded-lg shadow border cursor-pointer hover:shadow-xl transition-shadow"
                  onClick={() => router.push(`/productDetail-page?id=${product.id}`)}
                >
                  <div className="w-full h-40 bg-gray-200 flex items-center justify-center rounded-md">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                  <h3 className="text-md font-semibold mt-2">{product.name}</h3>
                  <p className="text-lg font-bold mt-1">${product.price.toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-md hover:bg-gray-200"
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
                  className="px-4 py-2 border rounded-md hover:bg-gray-200"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </section>
      </section>
    </div>
  );
}
