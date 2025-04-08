const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const router = express.Router();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authorization token not provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

/**
 * 🔹 Get user order list (GET /api/orders)
 * Customer: Retrieve own orders
 * Farmer: Retrieve orders for their store's products
 * Admin: Retrieve all orders
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    let where = {};
    
    // Filter conditions based on user role
    if (req.user.role === 'CUSTOMER') {
      // Customers can only view their own orders
      where.customerId = req.user.id;
    } else if (req.user.role === 'FARMER') {
      // Farmers view orders containing products from their store
      where.items = {
        some: {
          product: {
            store: {
              ownerId: req.user.id
            }
          }
        }
      };
    }
    // Admins can view all orders, no additional filtering needed

    // Apply status filter
    if (status) {
      where.status = status;
    }

    // Retrieve orders
    const orders = await prisma.order.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
                store: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Get total count
    const total = await prisma.order.count({ where });

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    res.status(500).json({ message: 'Failed to retrieve order list' });
  }
});

/**
 * 🔹 Get order details (GET /api/orders/:id)
 * Only relevant users can view (customer, store owner, or admin)
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Retrieve order details
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
                store: {
                  select: {
                    id: true,
                    name: true,
                    ownerId: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check permissions
    const isCustomer = req.user.id === order.customerId;
    const isFarmer = req.user.role === 'FARMER' && order.items.some(
      item => item.product.store.ownerId === req.user.id
    );
    const isAdmin = req.user.role === 'ADMIN';

    if (!isCustomer && !isFarmer && !isAdmin) {
      return res.status(403).json({ message: 'Permission denied to view this order' });
    }

    res.json(order);
  } catch (error) {
    console.error("❌ Error fetching order:", error);
    res.status(500).json({ message: 'Failed to retrieve order details' });
  }
});

/**
 * 🔹 Create an order (POST /api/orders)
 * Only customers can create orders
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { items } = req.body;
    
    // Check user role
    if (req.user.role !== 'CUSTOMER') {
      return res.status(403).json({ message: 'Only customers can create orders' });
    }
    
    // Validate order items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one product' });
    }

    // Retrieve product details
    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds }
      }
    });

    // Create product ID to product mapping
    const productMap = {};
    products.forEach(product => {
      productMap[product.id] = product;
    });

    // Validate all products exist and have sufficient stock
    for (const item of items) {
      const product = productMap[item.productId];
      
      if (!product) {
        return res.status(400).json({ message: `Product ${item.productId} does not exist` });
      }
      
      if (product.quantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for product ${product.name}, available: ${product.quantity}` 
        });
      }
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = items.map(item => {
      const product = productMap[item.productId];
      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;
      
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.price  // Record price at the time of order
      };
    });

    // Execute transaction to ensure all operations succeed
    const order = await prisma.$transaction(async (prisma) => {
      // Create order
      const newOrder = await prisma.order.create({
        data: {
          customerId: req.user.id,
          totalAmount,
          status: 'PENDING',
          items: {
            create: orderItems
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      // Update product stock
      for (const item of items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            quantity: {
              decrement: item.quantity
            }
          }
        });
      }

      return newOrder;
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

/**
 * 🔹 Get list of order statuses (GET /api/orders/statuses)
 * Public API
 */
router.get('/statuses', async (req, res) => {
  try {
    // Return all available order statuses
    res.json({
      statuses: [
        'PENDING',
        'PREPARED',
        'DELIVERED',
        'COMPLETED',
        'CANCELLED'
      ]
    });
  } catch (error) {
    console.error("❌ Error fetching order statuses:", error);
    res.status(500).json({ message: 'Failed to retrieve order status list' });
  }
});

/**
 * 🔹 Cancel an order (POST /api/orders/:id/cancel)
 * Only customers can cancel their own orders
 */
router.post('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Retrieve order
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check permissions
    if (req.user.role !== 'CUSTOMER' || order.customerId !== req.user.id) {
      return res.status(403).json({ message: 'Permission denied to cancel this order' });
    }

    // Check if order can be cancelled
    if (order.status !== 'PENDING') {
      return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    }

    // Execute transaction to ensure all operations succeed
    const updatedOrder = await prisma.$transaction(async (prisma) => {
      // Update order status
      const cancelledOrder = await prisma.order.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date()
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      // Restore product stock
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            quantity: {
              increment: item.quantity
            }
          }
        });
      }

      return cancelledOrder;
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error("❌ Error cancelling order:", error);
    res.status(500).json({ message: 'Failed to cancel order' });
  }
});

/**
 * 🔹 Update order status (PUT /api/orders/:id/status)
 * Only farmers and admins can update order status
 */
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Check user role
    if (req.user.role !== 'FARMER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only farmers and admins can update order status' });
    }

    // Retrieve order
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                store: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user has permission to update this order
    if (req.user.role === 'FARMER') {
      const isOrderFromStore = order.items.some(
        item => item.product.store.ownerId === req.user.id
      );
      if (!isOrderFromStore) {
        return res.status(403).json({ message: 'Permission denied to update this order' });
      }
    }

    // Validate status transition
    const validTransitions = {
      'PENDING': ['PREPARED', 'CANCELLED'],
      'PREPARED': ['DELIVERED', 'CANCELLED'],
      'DELIVERED': ['COMPLETED'],
      'COMPLETED': [],
      'CANCELLED': []
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status transition from ${order.status} to ${status}` 
      });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        ...(status === 'COMPLETED' && { completedAt: new Date() })
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error("❌ Error updating order status:", error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

/**
 * 🔹 Add order review (POST /api/orders/:id/review)
 * Only customers can review their own completed orders
 */
router.post('/:id/review', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    
    // Check user role
    if (req.user.role !== 'CUSTOMER') {
      return res.status(403).json({ message: 'Only customers can review orders' });
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Retrieve order
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                store: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check permissions and order status
    if (order.customerId !== req.user.id) {
      return res.status(403).json({ message: 'Permission denied to review this order' });
    }

    if (order.status !== 'COMPLETED') {
      return res.status(400).json({ message: 'Only completed orders can be reviewed' });
    }

    // Check if order already has a review
    const existingReview = await prisma.review.findUnique({
      where: { orderId: id }
    });

    if (existingReview) {
      return res.status(400).json({ message: 'Order already has a review' });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        orderId: id,
        customerId: req.user.id,
        storeId: order.items[0].product.storeId, // Assuming all items are from the same store
        rating,
        comment,
        createdAt: new Date()
      }
    });

    // Update store average rating
    const storeReviews = await prisma.review.findMany({
      where: { storeId: order.items[0].product.storeId }
    });

    const averageRating = storeReviews.reduce((acc, review) => acc + review.rating, 0) / storeReviews.length;

    await prisma.store.update({
      where: { id: order.items[0].product.storeId },
      data: {
        rating: averageRating
      }
    });

    res.status(201).json(review);
  } catch (error) {
    console.error("❌ Error creating review:", error);
    res.status(500).json({ message: 'Failed to create review' });
  }
});

module.exports = router;
