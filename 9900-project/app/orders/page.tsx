'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, Typography, Box, Chip, CircularProgress, Grid, Container } from '@mui/material';
import { format } from 'date-fns';

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

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/orders', {
          headers: {
            'Authorization': `Bearer ${user?.token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data.orders);
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
  }, [user]);

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
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} key={order.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                      Order #{order.id.slice(0, 8)}
                    </Typography>
                    <Chip
                      label={order.status}
                      color={
                        order.status === 'COMPLETED' ? 'success' :
                        order.status === 'PENDING' ? 'warning' :
                        'default'
                      }
                    />
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
      </Box>
    </Container>
  );
} 