"use client";
import { useEffect, useState } from "react";
import { format } from "date-fns";

// Define types for our data
type Product = {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
    store: {
        id: string;
        name: string;
        ownerId: string;
    };
};

type OrderItem = {
    id: string;
    quantity: number;
    price: number;
    product: Product;
};

type Customer = {
    id: string;
    name: string | null;
    email: string;
};

type Order = {
    id: string;
    totalAmount: number;
    status: OrderStatus;
    createdAt: string;
    items: OrderItem[];
    customer: Customer;
};

type OrderStatus = 'PENDING' | 'PREPARED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';

type ApiResponse = {
    orders: Order[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
};

export default function FarmerOrder() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusDropdownOpen, setStatusDropdownOpen] = useState<string | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
    const [debugMode, setDebugMode] = useState(false);
    
    // Define available status options based on the current status
    const getStatusOptions = (currentStatus: OrderStatus): OrderStatus[] => {
        switch (currentStatus) {
            case 'PENDING':
                return ['PENDING', 'PREPARED', 'CANCELLED'];
            case 'PREPARED':
                return ['PREPARED', 'DELIVERED', 'CANCELLED'];
            case 'DELIVERED':
                return ['DELIVERED', 'COMPLETED', 'CANCELLED'];
            case 'COMPLETED':
                return ['COMPLETED'];
            case 'CANCELLED':
                return ['CANCELLED'];
            default:
                return ['PENDING', 'PREPARED', 'DELIVERED', 'COMPLETED', 'CANCELLED'];
        }
    };

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        try {
            setUpdatingStatus(orderId);
            setError(null); // Clear any previous errors
            
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            // Log the token (without showing sensitive parts)
            const tokenParts = token.split('.');
            console.log(`Token format check: ${tokenParts.length} parts, first part length: ${tokenParts[0]?.length || 0}`);

            console.log(`Updating order ${orderId} to status ${newStatus}`);
            console.log(`Request URL: http://localhost:5001/api/orders/${orderId}`);
            
            // First, verify the order exists by trying to fetch it
            const checkResponse = await fetch(`http://localhost:5001/api/orders/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!checkResponse.ok) {
                console.error(`Failed to verify order: ${checkResponse.status} ${checkResponse.statusText}`);
                if (checkResponse.status === 404) {
                    throw new Error(`Order ID ${orderId} not found`);
                }
            } else {
                console.log('Order verification successful');
            }
            
            const response = await fetch(`http://localhost:5001/api/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            console.log('Response status:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                try {
                    const errorData = JSON.parse(errorText);
                    throw new Error(errorData.message || 'Failed to update status');
                } catch (e) {
                    throw new Error(`Failed to update status: ${response.status} ${response.statusText}`);
                }
            }

            const data = await response.json();
            console.log('Update successful:', data);
            
            // Close the dropdown
            setStatusDropdownOpen(null);
            
            // Refresh orders to see the updated status
            await fetchOrders();
        } catch (err) {
            console.error('Error updating status:', err);
            setError(err instanceof Error ? err.message : 'An error occurred while updating status');
        } finally {
            setUpdatingStatus(null);
        }
    };
    
    const fetchOrders = async () => {
        try {
            setError(null);
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            // The API already filters orders for farmers based on the user's role and ID
            const response = await fetch(`http://localhost:5001/api/orders?page=${currentPage}&limit=10`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch orders');

            const data: ApiResponse = await response.json();
            console.log('API response:', data);
            
            // Log order IDs for debugging
            if (data.orders && data.orders.length > 0) {
                console.log('Order IDs:', data.orders.map(order => order.id));
            }
            
            // No need to filter orders here as the backend already does that for farmer users
            setOrders(data.orders);
            setTotalPages(data.pagination.pages);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Toggle debug mode
    const toggleDebugMode = () => {
        setDebugMode(!debugMode);
    };

    // Function to format the date
    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'PPP');
        } catch (e) {
            return dateString;
        }
    };

    // Get status color classes
    const getStatusClasses = (status: OrderStatus) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'PREPARED':
                return 'bg-blue-100 text-blue-800';
            case 'DELIVERED':
                return 'bg-green-100 text-green-800';
            case 'COMPLETED':
                return 'bg-green-100 text-green-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div className="flex justify-center items-center p-8">Loading orders...</div>;
    if (error) return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="bg-red-100 border border-red-500 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
                <button 
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-3"
                    onClick={() => {
                        setError(null);
                        fetchOrders();
                    }}
                >
                    Try Again
                </button>
            </div>
        </div>
    );

    return (
        <div className="p-6 max-w-6xl mx-auto max-h-screen">
            <div className="flex justify-center items-center mb-6">
                <h1 className="text-2xl font-bold">Your Orders</h1>
            </div>
            
            
            {error && (
                <div className="bg-red-100 border border-red-500 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                    <button 
                        className="absolute top-0 bottom-0 right-0 px-4 py-3"
                        onClick={() => setError(null)}
                    >
                        <span className="text-red-500">×</span>
                    </button>
                </div>
            )}
            
            {debugMode && orders.length > 0 && (
                <div className="bg-gray-100 p-4 rounded mb-6 overflow-auto">
                    <h3 className="font-bold mb-2">Debug Information</h3>
                    <p className="mb-2"><strong>Order IDs:</strong></p>
                    <pre className="text-xs">
                        {JSON.stringify(orders.map(order => ({
                            id: order.id,
                            status: order.status,
                            items: order.items.length
                        })), null, 2)}
                    </pre>
                </div>
            )}
            
            {orders.length === 0 ? (
                <div className="bg-gray-50 p-8 rounded-lg text-center">
                    <p className="text-gray-600">No orders found for your store.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white shadow rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                                <div>
                                    <span className="font-medium">Order ID: </span>
                                    <span className="text-gray-700">{order.id}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div>
                                        <span className="font-medium">Date: </span>
                                        <span className="text-gray-700">{formatDate(order.createdAt)}</span>
                                    </div>
                                    <div className="relative">
                                        <span className="font-medium">Status: </span>
                                        <button
                                            onClick={() => setStatusDropdownOpen(statusDropdownOpen === order.id ? null : order.id)}
                                            className={`px-2 py-1 rounded text-xs font-medium ${getStatusClasses(order.status)} cursor-pointer hover:opacity-80 flex items-center gap-1`}
                                            disabled={updatingStatus === order.id}
                                        >
                                            {order.status}
                                            {updatingStatus === order.id ? (
                                                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                                    <circle 
                                                        className="opacity-25" 
                                                        cx="12" 
                                                        cy="12" 
                                                        r="10" 
                                                        stroke="currentColor" 
                                                        strokeWidth="4"
                                                        fill="none"
                                                    />
                                                    <path 
                                                        className="opacity-75" 
                                                        fill="currentColor" 
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    />
                                                </svg>
                                            ) : (
                                                <svg 
                                                    xmlns="http://www.w3.org/2000/svg" 
                                                    className="h-3 w-3" 
                                                    fill="none" 
                                                    viewBox="0 0 24 24" 
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            )}
                                        </button>
                                        
                                        {statusDropdownOpen === order.id && (
                                            <div className="absolute right-0 mt-1 bg-white border rounded shadow-lg z-10 w-36">
                                                {getStatusOptions(order.status).map((status) => (
                                                    <button
                                                        key={status}
                                                        onClick={() => handleStatusChange(order.id, status)}
                                                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${order.status === status ? 'font-bold' : ''}`}
                                                    >
                                                        {status}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-4">
                                <div className="mb-4">
                                    <h3 className="font-medium mb-2">Customer Information</h3>
                                    <p><span className="text-gray-600">Name:</span> {order.customer.name || 'N/A'}</p>
                                    <p><span className="text-gray-600">Email:</span> {order.customer.email}</p>
                                </div>
                                
                                <h3 className="font-medium mb-2">Items</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="border-b text-left text-sm font-medium text-gray-500">
                                                <th className="px-4 py-2">Product</th>
                                                <th className="px-4 py-2">Price</th>
                                                <th className="px-4 py-2">Quantity</th>
                                                <th className="px-4 py-2">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.items.map((item) => (
                                                <tr key={item.id} className="border-b">
                                                    <td className="px-4 py-2">
                                                        <div className="flex items-center">
                                                            <span>{item.product.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2">${item.price.toFixed(2)}</td>
                                                    <td className="px-4 py-2">{item.quantity}</td>
                                                    <td className="px-4 py-2">${(item.price * item.quantity).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="font-medium">
                                                <td colSpan={3} className="px-4 py-2 text-right">Total:</td>
                                                <td className="px-4 py-2">${order.totalAmount.toFixed(2)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                    <nav className="flex items-center gap-1">
                        <button 
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded border disabled:opacity-50"
                        >
                            Previous
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-3 py-1 rounded ${
                                    currentPage === page 
                                        ? 'bg-green-600 text-white' 
                                        : 'border hover:bg-gray-50'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                        
                        <button 
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 rounded border disabled:opacity-50"
                        >
                            Next
                        </button>
                    </nav>
                </div>
            )}
        </div>
    );
}