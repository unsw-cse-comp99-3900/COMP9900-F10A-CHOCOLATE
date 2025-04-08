'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, Typography, Box, Chip, CircularProgress, Grid, Container, Button, Pagination } from '@mui/material';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface OrderItem {
  id: string;
  quantity: number;
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
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const queryParams = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString()
        });
        
        if (statusFilter) {
          queryParams.append('status', statusFilter);
        }

        const response = await fetch(`http://localhost:5001/api/orders?${queryParams}`, {
          headers: {
            'Authorization': `Bearer ${user?.token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data.orders);
        setPagination(data.pagination);
      } catch (err) {
        setError('Failed to load orders');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchOrders();
    }
  }, [user, pagination.page, statusFilter]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPagination(prev => ({ ...prev, page: value }));
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  if (!user) {
    return (
      <Container>
        <Box sx={{ py: 4 }}>
          <Typography variant="h5" align="center">
            Please log in to view your orders
          </Typography>
        </Box>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Box sx={{ py: 4 }}>
          <Typography color="error" align="center">
            {error}
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Orders
        </Typography>

        {/* Status Filter */}
        <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
          <Button
            variant={statusFilter === '' ? 'contained' : 'outlined'}
            onClick={() => handleStatusFilter('')}
          >
            All
          </Button>
          <Button
            variant={statusFilter === 'PENDING' ? 'contained' : 'outlined'}
            onClick={() => handleStatusFilter('PENDING')}
          >
            Pending
          </Button>
          <Button
            variant={statusFilter === 'COMPLETED' ? 'contained' : 'outlined'}
            onClick={() => handleStatusFilter('COMPLETED')}
          >
            Completed
          </Button>
          <Button
            variant={statusFilter === 'CANCELLED' ? 'contained' : 'outlined'}
            onClick={() => handleStatusFilter('CANCELLED')}
          >
            Cancelled
          </Button>
        </Box>

        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} key={order.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                      Order #{order.id.slice(0, 8)}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Chip
                        label={order.status}
                        color={
                          order.status === 'COMPLETED' ? 'success' :
                          order.status === 'PENDING' ? 'warning' :
                          order.status === 'CANCELLED' ? 'error' :
                          'default'
                        }
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => router.push(`/orders/${order.id}`)}
                      >
                        View Details
                      </Button>
                    </Box>
                  </Box>
                  <Typography color="text.secondary" gutterBottom>
                    Placed on {format(new Date(order.createdAt), 'PPP')}
                  </Typography>
                  <Box mt={2}>
                    {order.items.map((item) => (
                      <Box key={item.id} mb={1}>
                        <Typography>
                          {item.quantity}x {item.product.name} - ${item.product.price.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          from {item.product.store.name}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  <Box mt={2} display="flex" justifyContent="flex-end">
                    <Typography variant="h6">
                      Total: ${order.totalAmount.toFixed(2)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <Box display="flex" justifyContent="center" mt={4}>
            <Pagination
              count={pagination.pages}
              page={pagination.page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}
      </Box>
    </Container>
  );
} 