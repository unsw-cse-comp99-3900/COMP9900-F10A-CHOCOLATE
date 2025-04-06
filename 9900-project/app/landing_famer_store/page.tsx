"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Filter from "@/components/ui/filter";
import { CirclePlus } from "lucide-react";
import Image from "next/image";

export default function FarmerOwnStorePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("default");
  const productsPerPage = 9;

  useEffect(() => {
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!storedUser) {
      setError("User not found");
      return;
    }

    const user = JSON.parse(storedUser);
    setUserId(user.id);
  }, []);

  useEffect(() => {
    if (!userId) return;

    async function fetchMyStore() {
      try {
        const response = await fetch("http://localhost:5001/api/stores");
        const stores = await response.json();

        const store = stores.find((s: any) => s.ownerId === userId);
        // if (!store) throw new Error("You haven't created a store yet.");
        setStore({
          id: store.owner.id,
          name: store.name,
          image: store.imageUrl,
          description: store.description,
          rating: store.rating,
        });

        setProducts(store.products);
        setFilteredProducts(store.products);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMyStore();
  }, [userId]);

  const handleFilterChange = (filters: { category: string; priceRange: number[] }) => {
    const filtered = products.filter((product) => {
      const isCategoryMatch =
        filters.category === "All Products" || product.category === filters.category;
      const isPriceMatch =
        product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];
      return isCategoryMatch && isPriceMatch;
    });

    setFilteredProducts(filtered);
    setCurrentPage(1); // reset to first page on filter
  };

  // 处理排序
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSortOption(value);

    let sortedProducts = [...filteredProducts];

    if (value === "price-low-high") {
      sortedProducts.sort((a, b) => a.price - b.price);
    } else if (value === "price-high-low") {
      sortedProducts.sort((a, b) => b.price - a.price);
    } else {
      // 默认排序逻辑，可以根据需要调整
      sortedProducts = store.products;
    }

    setFilteredProducts(sortedProducts);
    setCurrentPage(1); // reset to first page on sort
  };

  // 提前计算分类数据
  const categoryMap = products.reduce((acc: Record<string, number>, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  const categories = [
    { name: "All Products", count: products.length },
    ...Object.entries(categoryMap).map(([name, count]) => ({ name, count })),
  ];

  const startIndex = (currentPage - 1) * productsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 店铺信息 */}
      <section className="relative h-[350px] w-full flex items-center justify-center">
        {/* 使用 next/image 组件来显示图片 */}
        <div className="absolute inset-0">
          <Image
            src={store?.image || "/default-store-bg.jpg"}  // 使用 store.image 或者默认图片
            alt={store?.name || "Store Image"}
            layout="fill"  // 使图片覆盖整个容器
            objectFit="cover"  // 保持图片的比例并裁剪填满容器
            className="z-0"
          />
        </div>
        
        <div className="absolute inset-0 bg-black/40" /> {/* 模糊遮罩层 */}
        
        <div className="relative text-center text-white z-10">
          <h1 className="text-5xl font-extrabold drop-shadow-md">{store.name}</h1>
          <p className="mt-4 text-xl font-medium drop-shadow-sm">{store.description}</p>
          <button
            onClick={() => router.push("/account/profile")}
            className="mt-6 px-6 py-3 bg-white text-black font-semibold rounded-md shadow hover:bg-gray-200 transition"
          >
            Change Profile
          </button>
        </div>
      </section>

      {/* 筛选 + 产品列表 */}
      <section className="container mx-auto px-6 py-10 flex flex-col md:flex-row gap-6">
        {/* Filter Sidebar */}
        <div className="md:w-1/4">
          <Filter categories={categories} onFilterChange={handleFilterChange} />
        </div>

        {/* Product Grid */}
        <div className="flex-1 bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between w-full mb-5">
                {/* Upload a new product section */}
                <div className="flex items-center space-x-4">
                    <button
                    onClick={() => router.push("/product-upload-page")}
                    className="bg-transparent border-none p-0 hover:bg-transparent focus:outline-none"
                    >
                    <CirclePlus size={24} className="cursor-pointer" />
                    </button>
                    <p className="text-black">Upload a new product</p>
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center">
                    <label htmlFor="sort" className="mr-2 text-sm font-medium text-gray-700">Sort by:</label>
                    <select
                    id="sort"
                    value={sortOption}
                    onChange={handleSortChange}
                    className="border border-gray-300 rounded-md py-2 px-3 bg-white text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    >
                    <option value="default">Default</option>
                    <option value="price-low-high">Price: Low to High</option>
                    <option value="price-high-low">Price: High to Low</option>
                    </select>
                </div>
            </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedProducts.map((product) => (
              <div
                key={product.id}
                className="p-4 border rounded-lg shadow hover:shadow-lg cursor-pointer"
                onClick={() => router.push(`/productDetail-page?id=${product.id}`)}
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded"
                />
                <h3 className="font-semibold mt-2">{product.name}</h3>
                <p className="text-lg font-bold text-gray-800">${product.price.toFixed(2)}</p>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}>Previous</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={currentPage === i + 1 ? "font-bold" : ""}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
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
