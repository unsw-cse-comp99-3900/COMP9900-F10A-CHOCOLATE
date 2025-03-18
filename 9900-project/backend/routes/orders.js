const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const router = express.Router();

// 身份验证中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: '未提供认证令牌' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: '无效或过期的令牌' });
    }
    req.user = user;
    next();
  });
};

/**
 * 🔹 获取用户订单列表 (GET /api/orders)
 * 顾客：获取自己的订单
 * 农民：获取自己店铺的订单
 * 管理员：获取所有订单
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    let where = {};
    
    // 根据用户角色设置过滤条件
    if (req.user.role === 'CUSTOMER') {
      // 顾客只能查看自己的订单
      where.customerId = req.user.id;
    } else if (req.user.role === 'FARMER') {
      // 农民查看包含自己店铺产品的订单
      // 这里需要复杂的JOIN查询，使用Prisma的嵌套过滤
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
    // 管理员可以查看所有订单，不需要额外过滤

    // 添加状态过滤
    if (status) {
      where.status = status;
    }

    // 查询订单
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

    // 获取总数
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
    res.status(500).json({ message: '获取订单列表失败' });
  }
});

/**
 * 🔹 获取订单详情 (GET /api/orders/:id)
 * 只有订单相关的用户可以查看（顾客、对应店铺的农民、管理员）
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 查询订单详情
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
      return res.status(404).json({ message: '订单不存在' });
    }

    // 检查权限
    const isCustomer = req.user.id === order.customerId;
    const isFarmer = req.user.role === 'FARMER' && order.items.some(
      item => item.product.store.ownerId === req.user.id
    );
    const isAdmin = req.user.role === 'ADMIN';

    if (!isCustomer && !isFarmer && !isAdmin) {
      return res.status(403).json({ message: '权限不足，无法查看该订单' });
    }

    res.json(order);
  } catch (error) {
    console.error("❌ Error fetching order:", error);
    res.status(500).json({ message: '获取订单详情失败' });
  }
});

/**
 * 🔹 创建订单 (POST /api/orders)
 * 需要顾客角色
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { items } = req.body;
    
    // 检查用户角色
    if (req.user.role !== 'CUSTOMER') {
      return res.status(403).json({ message: '只有顾客可以创建订单' });
    }
    
    // 验证订单项
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: '订单至少需要一个商品' });
    }

    // 收集产品信息
    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds }
      }
    });

    // 创建产品ID到产品的映射
    const productMap = {};
    products.forEach(product => {
      productMap[product.id] = product;
    });

    // 验证所有产品是否存在并且有足够库存
    for (const item of items) {
      const product = productMap[item.productId];
      
      if (!product) {
        return res.status(400).json({ message: `产品 ${item.productId} 不存在` });
      }
      
      if (product.quantity < item.quantity) {
        return res.status(400).json({ 
          message: `产品 ${product.name} 库存不足，当前库存: ${product.quantity}` 
        });
      }
    }

    // 计算总金额
    let totalAmount = 0;
    const orderItems = items.map(item => {
      const product = productMap[item.productId];
      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;
      
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.price  // 记录下单时的价格
      };
    });

    // 开始事务，确保所有操作都成功完成
    const order = await prisma.$transaction(async (prisma) => {
      // 创建订单
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

      // 更新产品库存
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
    res.status(500).json({ message: '创建订单失败' });
  }
});

/**
 * 🔹 更新订单状态 (PUT /api/orders/:id)
 * 农民：可以更新自己店铺产品的订单
 * 管理员：可以更新任何订单
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // 检查状态是否有效
    const validStatuses = ['PENDING', 'PREPARED', 'DELIVERED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: '无效的订单状态' });
    }
    
    // 获取订单信息
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
      return res.status(404).json({ message: '订单不存在' });
    }

    // 检查权限
    const isFarmer = req.user.role === 'FARMER' && order.items.some(
      item => item.product.store.ownerId === req.user.id
    );
    const isAdmin = req.user.role === 'ADMIN';

    if (!isFarmer && !isAdmin) {
      return res.status(403).json({ message: '权限不足，无法更新该订单' });
    }

    // 如果订单被取消且之前不是取消状态，恢复库存
    if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
      await prisma.$transaction(async (prisma) => {
        // 更新订单状态
        const updatedOrder = await prisma.order.update({
          where: { id },
          data: { status }
        });

        // 恢复库存
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

        return updatedOrder;
      });
    } else {
      // 简单更新订单状态
      await prisma.order.update({
        where: { id },
        data: { status }
      });
    }

    res.json({ message: '订单状态已更新' });
  } catch (error) {
    console.error("❌ Error updating order:", error);
    res.status(500).json({ message: '更新订单失败' });
  }
});

/**
 * 🔹 获取订单状态列表 (GET /api/orders/statuses)
 * 公开接口
 */
router.get('/statuses', async (req, res) => {
  try {
    // 返回所有可用的订单状态
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
    res.status(500).json({ message: '获取订单状态列表失败' });
  }
});

module.exports = router; 