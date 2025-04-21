"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  store: {
    id: string;
    name: string;
  };
}

interface Store {
  id: string;
  name: string;
  imageUrl?: string;
  description?: string;
  rating?: number;
  ownerId: string;
  owner: {
    name: string;
  };
  products: Product[];
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'product';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch search results
  useEffect(() => {
    if (!query) {
      setIsLoading(false);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (type === 'product') {
          // Search for products
          const response = await fetch(`http://localhost:5001/api/products?search=${encodeURIComponent(query)}&limit=50`);
          if (!response.ok) {
            throw new Error('Failed to fetch products');
          }
          
          const data = await response.json();
          setProducts(data.products || []);
          setTotalItems(data.pagination?.total || 0);
        } else if (type === 'farmer') {
          // Fetch all stores then filter client-side
          const response = await fetch('http://localhost:5001/api/stores');
          if (!response.ok) {
            throw new Error('Failed to fetch stores');
          }
          
          const allStores = await response.json();
          // Filter stores by name (case insensitive)
          const filteredStores = allStores.filter((store: Store) => 
            store.name.toLowerCase().includes(query.toLowerCase()) ||
            (store.description && store.description.toLowerCase().includes(query.toLowerCase()))
          );
          
          setStores(filteredStores);
          setTotalItems(filteredStores.length);
        }
      } catch (err) {
        console.error('Search error:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query, type]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </button>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Search Results</h1>
        <p className="text-gray-600">
          {isLoading ? 'Searching...' : 
            totalItems > 0 
              ? `Found ${totalItems} ${type === 'product' ? 'products' : 'stores'} for "${query}"`
              : `No ${type === 'product' ? 'products' : 'stores'} found for "${query}"`
          }
        </p>
        
        <div className="mt-4 flex space-x-4">
          <Button
            variant={type === 'product' ? 'default' : 'outline'}
            onClick={() => router.push(`/search?q=${encodeURIComponent(query)}&type=product`)}
          >
            Products
          </Button>
          <Button
            variant={type === 'farmer' ? 'default' : 'outline'}
            onClick={() => router.push(`/search?q=${encodeURIComponent(query)}&type=farmer`)}
          >
            Farmers
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 mb-6 rounded-md">
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <>
          {type === 'product' ? (
            // Product search results
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.length > 0 ? (
                products.map((product) => (
                  <Link 
                    href={`/productDetail-page?id=${product.id}`}
                    key={product.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 flex flex-col"
                  >
                    <div className="relative w-full h-48 mb-3 bg-gray-100 rounded-md overflow-hidden">
                      <img 
                        src={product.imageUrl || '/product-placeholder.jpg'} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/product-placeholder.jpg';
                        }}
                      />
                    </div>
                    <h2 className="text-lg font-semibold mb-1 line-clamp-2">{product.name}</h2>
                    <p className="text-gray-600 text-sm mb-2">From: {product.store?.name || 'Unknown Store'}</p>
                    <p className="text-green-600 font-bold mt-auto">${product.price.toFixed(2)}</p>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 text-lg">No products found matching your search.</p>
                  <p className="text-gray-500">Try a different search term or browse our categories.</p>
                </div>
              )}
            </div>
          ) : (
            // Store search results
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.length > 0 ? (
                stores.map((store) => (
                  <Link 
                    href={`/farmer-page/${store.ownerId}`}
                    key={store.ownerId}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4"
                  >
                    <div className="relative w-full h-40 mb-3 bg-gray-100 rounded-md overflow-hidden">
                      <img 
                        src={store.imageUrl || '/store-placeholder.jpg'} 
                        alt={store.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/store-placeholder.jpg';
                        }}
                      />
                    </div>
                    <h2 className="text-xl font-semibold mb-1">{store.name}</h2>
                    <p className="text-gray-600 text-sm mb-2">
                      Owner: {store.owner?.name || 'Unknown'}
                    </p>
                    {store.rating && (
                      <div className="flex items-center mb-2">
                        <div className="flex text-yellow-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star}>
                              {star <= Math.round(store.rating || 0) ? '★' : '☆'}
                            </span>
                          ))}
                        </div>
                        <span className="ml-1 text-gray-600 text-sm">
                          ({store.rating?.toFixed(1) || '0.0'})
                        </span>
                      </div>
                    )}
                    {store.description && (
                      <p className="text-gray-600 text-sm line-clamp-2 mt-2">
                        {store.description}
                      </p>
                    )}
                    <div className="mt-3">
                      <p className="text-sm text-gray-500">
                        {store.products?.length ? `${store.products.length} products` : 'No products'}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 text-lg">No stores found matching your search.</p>
                  <p className="text-gray-500">Try a different search term or browse our home page.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
} 