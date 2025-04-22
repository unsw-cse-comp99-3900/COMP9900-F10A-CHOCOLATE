"use client";

import { useEffect, useState, use } from "react";
import Filter from "@/components/ui/filter";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatSlugName } from "@/lib/utils";

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  // Unwrap the params Promise using React.use()
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug.toLowerCase();
  
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string>("All Products");
  const [currentPage, setCurrentPage] = useState(1);
  const [categoriesArray, setCategoriesArray] = useState<{ name: string; count: number }[]>([]);
  const [sortOption, setSortOption] = useState<string>("default");
  const productsPerPage = 9;

  // Set current category based on the slug
  useEffect(() => {
    setCurrentCategory(slug === "shop" ? "All Products" : slug);
  }, [slug]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("http://localhost:5001/api/stores");
        if (!response.ok) throw new Error("Failed to fetch products");
  
        const stores = await response.json();
        let allProducts: any[] = [];
  
        // **获取所有产品，并转换 category 为小写**
        stores.forEach((store: any) => {
          store.products.forEach((product: any) => {
            allProducts.push({
              id: product.id,
              name: product.name,
              imageUrl: product.imageUrl,
              price: product.price,
              category: product.category.toLowerCase(), // **转换为小写**
              storeId: store.id,
              farmer: store.owner.name,
            });
          });
        });
  
        // **匹配 slug 和 category（忽略单复数）**
        let filtered = allProducts;
        // if (slug !== "shop") {
        //   filtered = allProducts.filter((product) =>
        //     product.category.includes(slug) // **允许模糊匹配**
        //   );
        // }
        if (slug !== "shop") {
          const normalize = (str: string) =>
            str.toLowerCase().replace(/[\s_]+/g, ""); // 把空格和下划线都去掉

          const normalizedSlug = normalize(slug);
          filtered = allProducts.filter((product) =>
            normalize(product.category).includes(normalizedSlug)
          );
        }

  
        // **检查过滤是否成功**
        console.log("Filtered Products:", filtered);
  
        // **计算分类信息**
        const categoryMap = allProducts.reduce((acc: Record<string, number>, product) => {
          acc[product.category] = (acc[product.category] || 0) + 1;
          return acc;
        }, {});
  
        setCategoriesArray(
          Object.entries(categoryMap).map(([name, count]) => ({ name, count }))
        );
        setProducts(allProducts);
        setFilteredProducts(filtered); // **初始时显示所有符合 slug 的产品**
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    }
  
    fetchProducts();
  }, [slug]);

  let bannerText = slug === "shop" ? "SHOP" : formatSlugName(slug);

  // **处理筛选逻辑**
  const handleFilterChange = ({ category, priceRange }: { category: string; priceRange: number[] }) => {
    let filtered = products;

    // **按类别筛选**
    if (category && category !== "All Products") {
      filtered = filtered.filter((product) => product.category === category);
      setCurrentCategory(category);
    } else {
      setCurrentCategory("All Products");
    }

    // **按价格筛选**
    if (priceRange.length === 2) {
      filtered = filtered.filter((product) => product.price >= priceRange[0] && product.price <= priceRange[1]);
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
    
    // Apply current sort when filters change
    applySorting(filtered);
  };
  
  // Handle sorting change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
    applySorting(filteredProducts);
  };
  
  // Apply sorting to products
  const applySorting = (products: any[]) => {
    let sortedProducts = [...products];
    
    switch (sortOption) {
      case "price-low-high":
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case "price-high-low":
        sortedProducts.sort((a, b) => b.price - a.price);
        break;
      default:
        // Keep default order
        break;
    }
    
    setFilteredProducts(sortedProducts);
  };
  
  // Apply sorting when sort option changes
  useEffect(() => {
    applySorting(filteredProducts);
  }, [sortOption]);

  // **分页逻辑**
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Banner Section */}
      <section className="relative text-center py-20 h-[300px] flex items-center justify-center shadow-lg overflow-hidden w-full">
        <div className="flex items-center gap-4">
          {/* 返回按钮 */}
          <button
            onClick={() => router.push(slug === "shop" ? `/` : `/#categories`)}
            className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-full hover:bg-gray-800 transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          {/* 类别标题 */}
          <h1 className="text-6xl font-extrabold drop-shadow-lg">{bannerText}</h1>
        </div>
      </section>

      {/* 主内容区：过滤 + 产品网格 */}
      <section className="container mx-auto px-6 py-10 flex flex-col md:flex-row md:justify-between">
        {/* 筛选侧边栏 */}
        <div className="w-full md:w-1/4 md:mr-6">
          <Filter categories={[{ name: "All Products", count: products.length }, ...categoriesArray]} onFilterChange={handleFilterChange} />
        </div>

        {/* 产品列表 */}
        <div className="flex-1 bg-white p-6 shadow rounded-lg">
          <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">
            {currentCategory === "All Products"
              ? "All Products"
              : `Products in ${formatSlugName(currentCategory)}`}
          </h2>
            
            {/* Sort dropdown */}
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

          {/* 产品网格 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="bg-white p-4 rounded-lg shadow border cursor-pointer hover:shadow-xl transition-shadow"
                  onClick={() => router.push(`/productDetail-page?id=${product.id}`)}
                >
                  <div className="w-full h-40 bg-gray-200 flex items-center justify-center rounded-md">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-md" />
                  </div>
                  <h3 className="text-md font-semibold mt-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm">{product.farmer}</p>
                  <p className="text-lg font-bold mt-1">${product.price.toFixed(2)}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No products found.</p>
            )}
          </div>

          {/* 分页控件 */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 border rounded-md ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"}`}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 border rounded-md ${currentPage === i + 1 ? "bg-black text-white" : "hover:bg-gray-200"}`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 border rounded-md ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"}`}
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
