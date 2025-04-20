"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Bell, LayoutDashboard, ShoppingCart, Users, Store, Eye } from 'lucide-react';
import { 
  DailyTransactionChart, 
  MonthlyTrendChart, 
  UserGrowthChart, 
  TopProductsChart 
} from '@/components/AdminCharts';

enum OrderStatus {
  PENDING = 'PENDING',
  PREPARED = 'PREPARED',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

interface Store {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  rating?: number;
  ownerId: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

interface Order {
  id: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  customerId: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      price: number;
      imageUrl: string;
      store: {
        id: string;
        name: string;
      };
    };
  }>;
}

interface StoreWithOrders extends Store {
  orders: Order[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stores, setStores] = useState<StoreWithOrders[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchStoresWithOrders();
    }
  }, [activeTab, currentPage]);

  const fetchStoresWithOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders?page=${currentPage}&limit=${itemsPerPage}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      if (!data.orders) {
        throw new Error('Invalid response format');
      }
      
      // 按商店对订单进行分组
      const storeMap = new Map<string, StoreWithOrders>();
      
      data.orders.forEach((order: Order) => {
        order.items.forEach(item => {
          const store = item.product.store;
          if (!storeMap.has(store.id)) {
            storeMap.set(store.id, {
              id: store.id,
              name: store.name,
              description: '',
              ownerId: '', // 由于后端API没有返回这些信息，我们设置默认值
              owner: {
                id: '',
                name: store.name,
                email: ''
              },
              orders: []
            } as StoreWithOrders);
          }
          
          const storeData = storeMap.get(store.id)!;
          if (!storeData.orders.find(o => o.id === order.id)) {
            storeData.orders.push(order);
          }
        });
      });
      
      setStores(Array.from(storeMap.values()));
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsViewingDetails(true);
  };

  const handleBackToList = () => {
    setSelectedOrder(null);
    setIsViewingDetails(false);
  };

  const handleLogout = () => {
    logout();
    router.push('/login-page');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Header */}
      <header className="bg-white shadow-sm">
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Bell className="h-5 w-5" />
            </button>
            <Button 
              variant="ghost"
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white h-[calc(100vh-4rem)] shadow-sm">
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <button
                  className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg ${
                    activeTab === 'dashboard' ? 'bg-green-50 text-green-600' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Dashboard</span>
                </button>
              </li>
              <li>
                <button
                  className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg ${
                    activeTab === 'orders' ? 'bg-green-50 text-green-600' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab('orders')}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Orders</span>
                </button>
              </li>
              <li>
                <button
                  className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg ${
                    activeTab === 'farmer' ? 'bg-green-50 text-green-600' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab('farmer')}
                >
                  <Store className="h-5 w-5" />
                  <span>Farmers</span>
                </button>
              </li>
              <li>
                <button
                  className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg ${
                    activeTab === 'customer' ? 'bg-green-50 text-green-600' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab('customer')}
                >
                  <Users className="h-5 w-5" />
                  <span>Customers</span>
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-2 gap-6">
              {/* Daily Transaction Data */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Daily Transaction Data</h3>
                <div className="h-64 bg-gray-50 rounded-lg">
                  <DailyTransactionChart />
                </div>
              </div>

              {/* Monthly Transaction Trends */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Monthly Transaction Trends</h3>
                <div className="h-64 bg-gray-50 rounded-lg">
                  <MonthlyTrendChart />
                </div>
              </div>

              {/* User Growth Statistics */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">User Growth Statistics</h3>
                <div className="h-64 bg-gray-50 rounded-lg">
                  <UserGrowthChart />
                </div>
              </div>

              {/* Top Selling Products */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
                <div className="h-64 bg-gray-50 rounded-lg">
                  <TopProductsChart />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Order Management</h2>
                {isViewingDetails && (
                  <Button
                    variant="outline"
                    onClick={handleBackToList}
                    className="flex items-center space-x-2"
                  >
                    Back to List
                  </Button>
                )}
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                </div>
              ) : error ? (
                <div className="text-center text-red-600 py-8">
                  {error}
                  <Button
                    variant="outline"
                    onClick={fetchStoresWithOrders}
                    className="mt-4"
                  >
                    Try Again
                  </Button>
                </div>
              ) : !isViewingDetails ? (
                stores.length > 0 ? (
                  <div className="space-y-8">
                    {stores.map((store) => (
                      <div key={store.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">{store.name}</h3>
                          <span className="text-sm text-gray-500">Owner: {store.owner.name}</span>
                        </div>
                        {store.orders && store.orders.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Order ID
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {store.orders.map((order) => (
                                  <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {order.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {order.customer.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {new Date(order.createdAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${order.status === OrderStatus.COMPLETED ? 'bg-green-100 text-green-800' : 
                                          order.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-800' : 
                                          order.status === OrderStatus.CANCELLED ? 'bg-red-100 text-red-800' :
                                          order.status === OrderStatus.DELIVERED ? 'bg-blue-100 text-blue-800' :
                                          'bg-gray-100 text-gray-800'}`}>
                                        {order.status}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      ${order.totalAmount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleViewOrder(order)}
                                        className="text-green-600 hover:text-green-900"
                                      >
                                        <Eye className="h-4 w-4 mr-1" />
                                        View
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-4">No orders for this store</p>
                        )}
                      </div>
                    ))}
                    
                    {/* Pagination controls */}
                    <div className="mt-4 flex justify-center">
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === 1
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          Previous
                        </button>
                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === totalPages
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No stores found
                  </div>
                )
              ) : (
                selectedOrder && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Order Details</h3>
                        <p className="text-sm text-gray-600">Order ID: {selectedOrder.id}</p>
                        <p className="text-sm text-gray-600">Customer: {selectedOrder.customer.name}</p>
                        <p className="text-sm text-gray-600">Email: {selectedOrder.customer.email}</p>
                        <p className="text-sm text-gray-600">
                          Created: {new Date(selectedOrder.createdAt).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Updated: {new Date(selectedOrder.updatedAt).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">Status: {selectedOrder.status}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Product
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Store
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Quantity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Subtotal
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedOrder.items.map((item) => (
                            <tr key={item.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.product.name}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {item.product.store.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.quantity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ${item.product.price.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ${(item.quantity * item.product.price).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gray-50">
                            <td colSpan={4} className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                              Total:
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              ${selectedOrder.totalAmount.toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {activeTab === 'farmer' && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold mb-4">Farmer Management</h2>
              {/* Farmer management content will be implemented here */}
            </div>
          )}

          {activeTab === 'customer' && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold mb-4">Customer Management</h2>
              {/* Customer management content will be implemented here */}
            </div>
          )}
        </main>
      </div>
    </div>
  );
} 
