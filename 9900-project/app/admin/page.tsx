"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext'; // 可选，如果你用 AuthContext 的话
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import {
  LogOut,
  Bell,
  LayoutDashboard,
  ShoppingCart,
  Users,
  Store,
  Eye,
} from 'lucide-react';

import {
  DailyTransactionChart,
  MonthlyTrendChart,
  UserGrowthChart,
  TopProductsChart,
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

interface Customer {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  ordersCount: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { logout } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedStatus, setSelectedStatus] = useState('');

  const [farmers, setFarmers] = useState<{ id: string; name: string; image: string; description: string; rating: number }[]>([]);
  const [farmerLoading, setFarmerLoading] = useState(true);
  const [farmerError, setFarmerError] = useState<string | null>(null);
  const [farmerPage, setFarmerPage] = useState(1);
  const farmersPerPage = 8;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerLoading, setCustomerLoading] = useState(true);
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [customerPage, setCustomerPage] = useState(1);
  const customersPerPage = 10;
  const totalCustomerPages = Math.ceil(customers.length / customersPerPage);
  const [editingField, setEditingField] = useState<{ id: string; field: string } | null>(null);

  // 更新本地状态
  const updateCustomerField = (index: number, field: string, value: any) => {
    setCustomers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // 自动保存字段（失焦时触发）
  const saveField = async (id: string, updateData: Partial<Customer>) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!res.ok) throw new Error('Failed to save');
      console.log(`✅ Field saved for user ${id}`);
    } catch (err) {
      console.error('❌ Save failed:', err);
      alert('Failed to save changes');
    }
  };
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');

    if (!token || !userStr) return router.push('/login-page?mode=admin');

    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'ADMIN') router.push('/login-page?mode=admin');
    } catch {
      router.push('/login-page?mode=admin');
    }
  }, [router]);

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'customer') fetchCustomers();
  }, [activeTab, currentPage, selectedStatus]);

    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) throw new Error('Token not found');
    
        const url = `http://localhost:5001/api/orders?page=${currentPage}&limit=${itemsPerPage}${selectedStatus ? `&status=${selectedStatus}` : ''}`;
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
    
        if (!response.ok) throw new Error(await response.text());
    
        const data = await response.json();
    
        setOrders(data.orders);
        setTotalPages(data.pagination.pages);
      } catch (err: any) {
        console.error('Error fetching orders:', err);
        setError(err.message || 'Failed to fetch orders');
      } finally {
        setIsLoading(false);
      }
    };  

    const fetchOrderDetails = async (orderId: string) => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const res = await fetch(`http://localhost:5001/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch order details');
        const data = await res.json();
        setSelectedOrder(data);
        setIsViewingDetails(true);
      } catch (error) {
        console.error('Error loading order detail:', error);
      }
    };
    const fetchCustomers = async () => {
      setCustomerLoading(true);
      setCustomerError(null);
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const res = await fetch(`http://localhost:5001/api/users?role=CUSTOMER`, {
          headers: { Authorization: `Bearer ${token}` }
        });
    
        if (!res.ok) throw new Error('Failed to fetch customers');
        const data = await res.json();
    
        // 👇 为每个客户获取订单数（调用 /users/:id）
        const enrichedCustomers = await Promise.all(data
          .filter((user: any) => user.role === 'CUSTOMER') 
          .map(async (customer: any) => {
          try {
            const detailRes = await fetch(`http://localhost:5001/api/users/${customer.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (!detailRes.ok) throw new Error();
            const detail = await detailRes.json();
            return {
              ...customer,
              ordersCount: Array.isArray(detail.orders) ? detail.orders.length : 0,
            };
          } catch {
            return { ...customer, ordersCount: 0 };
          }
        }));
    
        setCustomers(enrichedCustomers);
      } catch (err: any) {
        console.error('Error fetching customers:', err);
        setCustomerError(err.message);
      } finally {
        setCustomerLoading(false);
      }
    };    

    useEffect(() => {
      if (activeTab === 'farmer') {
        const fetchFarmers = async () => {
          try {
            setFarmerLoading(true);
            setFarmerError(null);
            const response = await fetch("http://localhost:5001/api/stores");
            const data = await response.json();
    
            if (!Array.isArray(data)) {
              throw new Error("API did not return an array");
            }
    
            const formatted = data.map(store => ({
              id: store.owner?.id || "unknown",
              name: store.owner?.name || "Unknown Farmer",
              image: store.imageUrl || "/farmer1.jpg",
              description: store.description || "No description available",
              rating: store.rating || 0
            }));
    
            setFarmers(formatted);
          } catch (error) {
            console.error("Failed to fetch farmers:", error);
            setFarmerError("Failed to load farmers");
          } finally {
            setFarmerLoading(false);
          }
        };
    
        fetchFarmers();
      }
    }, [activeTab]);    

    const handleViewOrder = (order: Order) => fetchOrderDetails(order.id);
    const handleBackToList = () => { setSelectedOrder(null); setIsViewingDetails(false); };
    const handleLogout = () => {
      logout?.();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      router.push('/login-page?mode=admin');
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
                  <Button variant="outline" onClick={handleBackToList}>Back to List</Button>
                )}
              </div>

              {!isViewingDetails && (
                <div className="mb-4">
                  <label className="text-sm mr-2">Filter by Status:</label>
                  <select
                    className="border px-3 py-1 rounded text-sm"
                    value={selectedStatus}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="">All</option>
                    {Object.values(OrderStatus).map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              )}

              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                </div>
              ) : error ? (
                <div className="text-center text-red-600 py-8">
                  {error}
                  <Button variant="outline" onClick={fetchOrders} className="mt-4">Try Again</Button>
                </div>
              ) : !isViewingDetails ? (
                <div>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.id}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{order.customer.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${order.status === OrderStatus.COMPLETED ? 'bg-green-100 text-green-800' :
                                order.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                                order.status === OrderStatus.CANCELLED ? 'bg-red-100 text-red-800' :
                                order.status === OrderStatus.DELIVERED ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">${order.totalAmount.toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm font-medium">
                            <Button variant="ghost" size="sm" onClick={() => handleViewOrder(order)} className="text-green-600 hover:text-green-900">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  <div className="mt-4 flex justify-center">
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
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
                          currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              ) : (
                selectedOrder && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Order Details</h3>
                        <p className="text-sm text-gray-600">Order ID: {selectedOrder.id}</p>
                        <p className="text-sm text-gray-600">Customer: {selectedOrder.customer.name}</p>
                        <p className="text-sm text-gray-600">Email: {selectedOrder.customer.email}</p>
                        <p className="text-sm text-gray-600">Created: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Updated: {new Date(selectedOrder.updatedAt).toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Status: {selectedOrder.status}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedOrder.items.map((item) => (
                            <tr key={item.id}>
                              <td className="px-6 py-4 text-sm text-gray-900">{item.product.name}</td>
                              <td className="px-6 py-4 text-sm text-gray-500">{item.product.store.name}</td>
                              <td className="px-6 py-4 text-sm text-gray-500">{item.quantity}</td>
                              <td className="px-6 py-4 text-sm text-gray-500">${item.price.toFixed(2)}</td>
                              <td className="px-6 py-4 text-sm text-gray-500">${(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gray-50">
                            <td colSpan={4} className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                              Total:
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
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
              <h2 className="text-xl font-bold mb-6">Farmer Management</h2>

              {farmerLoading ? (
                <div className="text-center text-gray-500">Loading farmers...</div>
              ) : farmerError ? (
                <div className="text-center text-red-500">{farmerError}</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {farmers
                      .slice((farmerPage - 1) * farmersPerPage, farmerPage * farmersPerPage)
                      .map((farmer) => (
                        <div key={farmer.id} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
                          <div className="relative h-40 mb-4">
                            <img
                              src={farmer.image}
                              alt={farmer.name}
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                          <h3 className="text-lg font-semibold">{farmer.name}</h3>
                          <p className="text-sm text-gray-500 line-clamp-2 mb-2">{farmer.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-yellow-500 font-medium">★ {farmer.rating.toFixed(1)}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/farmer-page/${encodeURIComponent(farmer.id)}`)}
                            >
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Pagination */}
                  {Math.ceil(farmers.length / farmersPerPage) > 1 && (
                    <div className="mt-6 flex justify-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setFarmerPage((p) => Math.max(p - 1, 1))}
                        disabled={farmerPage === 1}
                      >
                        Previous
                      </Button>
                      {Array.from({ length: Math.ceil(farmers.length / farmersPerPage) }, (_, i) => (
                        <Button
                          key={i}
                          variant={farmerPage === i + 1 ? "default" : "outline"}
                          onClick={() => setFarmerPage(i + 1)}
                        >
                          {i + 1}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => setFarmerPage((p) => Math.min(p + 1, Math.ceil(farmers.length / farmersPerPage)))}
                        disabled={farmerPage === Math.ceil(farmers.length / farmersPerPage)}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'customer' && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold mb-4">Customer Management</h2>

              {customerLoading ? (
                <p className="text-center text-gray-500">Loading customers...</p>
              ) : customerError ? (
                <p className="text-center text-red-500">{customerError}</p>
              ) : (
                <>
                  <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Password</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    </tr>
                  </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {customers
                        .slice((customerPage - 1) * customersPerPage, customerPage * customersPerPage)
                        .map((customer, index) => (
                          <tr key={customer.id}>
                            {/* ID */}
                            <td className="px-6 py-4 text-sm text-gray-500 flex items-center gap-2">
                              <span>{customer.id}</span>
                              <button
                                onClick={() => navigator.clipboard.writeText(customer.id)}
                                className="text-gray-400 hover:text-gray-600"
                                title="Copy ID"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </td>

                            {/* Name */}
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {editingField?.id === customer.id && editingField.field === 'name' ? (
                                <input
                                  className="w-full text-sm border p-1"
                                  autoFocus
                                  value={customer.name}
                                  onChange={(e) => updateCustomerField(index, 'name', e.target.value)}
                                  onBlur={() => {
                                    saveField(customer.id, { name: customer.name });
                                    setEditingField(null);
                                  }}
                                />
                              ) : (
                                <span onClick={() => setEditingField({ id: customer.id, field: 'name' })} className="cursor-pointer hover:underline">
                                  {customer.name}
                                </span>
                              )}
                            </td>

                            {/* Email */}
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {editingField?.id === customer.id && editingField.field === 'email' ? (
                                <input
                                  className="w-full text-sm border p-1"
                                  value={customer.email}
                                  onChange={(e) => updateCustomerField(index, 'email', e.target.value)}
                                  onBlur={() => {
                                    saveField(customer.id, { email: customer.email });
                                    setEditingField(null);
                                  }}
                                />
                              ) : (
                                <span onClick={() => setEditingField({ id: customer.id, field: 'email' })} className="cursor-pointer hover:underline">
                                  {customer.email}
                                </span>
                              )}
                            </td>

                            {/* Password */}
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {editingField?.id === customer.id && editingField.field === 'password' ? (
                                <input
                                  className="w-full text-sm border p-1"
                                  value={customer.password || ''}
                                  type="text"
                                  placeholder="Enter new password"
                                  onChange={(e) => updateCustomerField(index, 'password', e.target.value)}
                                  onBlur={() => {
                                    saveField(customer.id, { password: customer.password });
                                    setEditingField(null);
                                  }}
                                />
                              ) : (
                                <span
                                  onClick={() => setEditingField({ id: customer.id, field: 'password' })}
                                  className="cursor-pointer hover:underline text-blue-600"
                                >
                                  Set Password
                                </span>
                              )}
                            </td>

                            {/* Phone */}
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {editingField?.id === customer.id && editingField.field === 'phone' ? (
                                <input
                                  className="w-full text-sm border p-1"
                                  value={customer.phone}
                                  onChange={(e) => updateCustomerField(index, 'phone', e.target.value)}
                                  onBlur={() => {
                                    saveField(customer.id, { phone: customer.phone });
                                    setEditingField(null);
                                  }}
                                />
                              ) : (
                                <span onClick={() => setEditingField({ id: customer.id, field: 'phone' })} className="cursor-pointer hover:underline">
                                  {customer.phone}
                                </span>
                              )}
                            </td>

                            {/* Address */}
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {editingField?.id === customer.id && editingField.field === 'address' ? (
                                <input
                                  className="w-full text-sm border p-1"
                                  value={customer.address}
                                  onChange={(e) => updateCustomerField(index, 'address', e.target.value)}
                                  onBlur={() => {
                                    saveField(customer.id, { address: customer.address });
                                    setEditingField(null);
                                  }}
                                />
                              ) : (
                                <span onClick={() => setEditingField({ id: customer.id, field: 'address' })} className="cursor-pointer hover:underline">
                                  {customer.address}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {new Date(customer.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>

                  {/* Pagination Controls */}
                  <div className="flex justify-center mt-4 space-x-2">
                    <Button
                      variant="outline"
                      disabled={customerPage === 1}
                      onClick={() => setCustomerPage(p => Math.max(p - 1, 1))}
                    >
                      Previous
                    </Button>
                    <span className="px-4 py-2 text-sm text-gray-600">
                      Page {customerPage} of {totalCustomerPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={customerPage === totalCustomerPages}
                      onClick={() => setCustomerPage(p => Math.min(p + 1, totalCustomerPages))}
                    >
                      Next
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
} 
