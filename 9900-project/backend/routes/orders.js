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
 * 🔹 Update order status (PUT /api/orders/:id)
 * Farmers can update orders for their products
 * Customers can update their own orders (e.g., cancel)
 * Admins can update any order
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log(`🔄 Update request for order ID: ${id}, New status: ${status}`);
    console.log(`🔑 User ID: ${req.user.id}, Role: ${req.user.role}`);
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    // Validate status value
    const validStatuses = ['PENDING', 'PREPARED', 'DELIVERED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status value',
        validValues: validStatuses
      });
    }
    
    // Retrieve order details to check permissions
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                store: {
                  select: {
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
      console.log(`❌ Order not found: ${id}`);
      return res.status(404).json({ message: 'Order not found' });
    }
    
    console.log(`✅ Order found: ${id}, Current status: ${order.status}`);
    
    // Check permissions
    const isCustomer = req.user.id === order.customerId;
    const isFarmer = req.user.role === 'FARMER' && order.items.some(
      item => item.product.store.ownerId === req.user.id
    );
    const isAdmin = req.user.role === 'ADMIN';
    
    console.log(`🔒 Permissions - Customer: ${isCustomer}, Farmer: ${isFarmer}, Admin: ${isAdmin}`);
    
    if (!isCustomer && !isFarmer && !isAdmin) {
      console.log(`❌ Permission denied for user ${req.user.id}`);
      return res.status(403).json({ message: 'Permission denied to update this order' });
    }
    
    // Additional permission checks based on user role and status transition
    if (req.user.role === 'CUSTOMER' && status !== 'CANCELLED') {
      return res.status(403).json({ message: 'Customers can only cancel orders' });
    }
    
    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
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
    
    console.log(`✅ Order updated successfully: ${id}, New status: ${status}`);
    res.json(updatedOrder);
  } catch (error) {
    console.error("❌ Error updating order status:", error);
    res.status(500).json({ message: 'Failed to update order status' });
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

module.exports = router;
