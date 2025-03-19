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
 * 🔹 获取当前用户的购物车 (GET /api/cart)
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const cartItems = await prisma.cart.findMany({
      where: { customerId: req.user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            imageUrl: true,
            store: { select: { name: true } }
          }
        }
      }
    });

    res.json(cartItems);
  } catch (error) {
    console.error("❌ 获取购物车失败:", error);
    res.status(500).json({ message: '获取购物车失败' });
  }
});

/**
 * 🔹 添加商品到购物车 (POST /api/cart)
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity <= 0) {
      return res.status(400).json({ message: '商品 ID 和数量必须有效' });
    }

    // 检查产品是否存在
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }

    // 检查是否已经在购物车中
    const existingCartItem = await prisma.cart.findFirst({
      where: { customerId: req.user.id, productId }
    });

    if (existingCartItem) {
      // 更新数量
      const updatedCart = await prisma.cart.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity }
      });
      return res.json(updatedCart);
    } else {
      // 创建新的购物车项
      const newCartItem = await prisma.cart.create({
        data: { customerId: req.user.id, productId, quantity }
      });
      return res.status(201).json(newCartItem);
    }
  } catch (error) {
    console.error("❌ 添加购物车失败:", error);
    res.status(500).json({ message: '添加购物车失败' });
  }
});

/**
 * 🔹 删除购物车商品 (DELETE /api/cart/:id)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // 检查购物车项是否存在
    const cartItem = await prisma.cart.findUnique({ where: { id } });
    if (!cartItem) {
      return res.status(404).json({ message: '购物车商品不存在' });
    }

    // 确保用户只能删除自己的购物车商品
    if (cartItem.customerId !== req.user.id) {
      return res.status(403).json({ message: '无权删除该购物车商品' });
    }

    // 删除购物车项
    await prisma.cart.delete({ where: { id } });

    res.json({ message: '购物车商品已删除' });
  } catch (error) {
    console.error("❌ 删除购物车失败:", error);
    res.status(500).json({ message: '删除购物车失败' });
  }
});

module.exports = router;
