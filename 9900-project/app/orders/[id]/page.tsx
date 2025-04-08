'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, Typography, Box, Chip, CircularProgress, Grid, Container, Button } from '@mui/material';
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
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/orders/${id}`, {
          headers: {
            'Authorization': `Bearer ${user?.token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }

        const data = await response.json();
        setOrder(data);
      } catch (err) {
        setError('Failed to load order details');
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token && id) {
      fetchOrder();
    }
  }, [user, id]);

  const handleCancelOrder = async () => {
    if (!order) return;
    
    try {
      setCancelling(true);
      const response = await fetch(`http://localhost:5001/api/orders/${order.id}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }

      // Refresh order details
      const updatedOrder = await response.json();
      setOrder(updatedOrder);
    } catch (err) {
      console.error('Error cancelling order:', err);
      setError('Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (!user) {
    return (
      <Container>
        <Box sx={{ py: 4 }}>
          <Typography variant="h5" align="center">
            Please log in to view order details
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

  if (error || !order) {
    return (
      <Container>
        <Box sx={{ py: 4 }}>
          <Typography color="error" align="center">
            {error || 'Order not found'}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => router.push('/orders')}
            sx={{ mt: 2, display: 'block', mx: 'auto' }}
          >
            Back to Orders
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ py: 4 }}>
        <Button 
          variant="outlined" 
          onClick={() => router.push('/orders')}
          sx={{ mb: 3 }}
        >
          Back to Orders
        </Button>

        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5">
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
                {order.status === 'PENDING' && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                  >
                    {cancelling ? 'Cancelling...' : 'Cancel Order'}
                  </Button>
                )}
              </Box>
            </Box>

            <Typography color="text.secondary" gutterBottom>
              Placed on {format(new Date(order.createdAt), 'PPP')}
            </Typography>

            <Box mt={4}>
              <Typography variant="h6" gutterBottom>
                Customer Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Name:</strong> {order.customer.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Email:</strong> {order.customer.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Phone:</strong> {order.customer.phone}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Address:</strong> {order.customer.address}</Typography>
                </Grid>
              </Grid>
            </Box>

            <Box mt={4}>
              <Typography variant="h6" gutterBottom>
                Order Items
              </Typography>
              <Grid container spacing={2}>
                {order.items.map((item) => (
                  <Grid item xs={12} key={item.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="subtitle1">
                              {item.quantity}x {item.product.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              from {item.product.store.name}
                            </Typography>
                          </Box>
                          <Typography variant="subtitle1">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Box mt={4} display="flex" justifyContent="flex-end">
              <Typography variant="h5">
                Total: ${order.totalAmount.toFixed(2)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
} 