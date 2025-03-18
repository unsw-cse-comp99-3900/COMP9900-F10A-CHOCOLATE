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
 * 🔹 获取所有店铺 (GET /api/stores)
 * 公开接口，任何人都可以查看
 */
router.get('/', async (req, res) => {
  try {
    const stores = await prisma.store.findMany({
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            imageUrl: true,
            category: true,
          },
          take: 5 // 只取前5个产品作为预览
        },
        owner: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    res.json(stores);
  } catch (error) {
    console.error("❌ Error fetching stores:", error);
    res.status(500).json({ message: '获取店铺列表失败' });
  }
});

/**
 * 🔹 获取店铺详情 (GET /api/stores/:id)
 * 公开接口，任何人都可以查看
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            imageUrl: true,
            quantity: true,
            category: true,
          }
        },
        owner: {
          select: {
            id: true,
            name: true
          }
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          take: 10, // 只显示10条评论
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!store) {
      return res.status(404).json({ message: '店铺不存在' });
    }

    res.json(store);
  } catch (error) {
    console.error("❌ Error fetching store:", error);
    res.status(500).json({ message: '获取店铺详情失败' });
  }
});

/**
 * 🔹 创建店铺 (POST /api/stores)
 * 需要农民角色权限
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, imageUrl } = req.body;
    
    // 检查用户角色
    if (req.user.role !== 'FARMER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: '权限不足，只有农民可以创建店铺' });
    }

    // 检查必填字段
    if (!name) {
      return res.status(400).json({ message: '店铺名称是必填项' });
    }

    // 检查用户是否已有店铺
    const existingStore = await prisma.store.findFirst({
      where: { ownerId: req.user.id }
    });

    if (existingStore) {
      return res.status(400).json({ message: '您已经拥有一个店铺' });
    }

    // 创建店铺
    const newStore = await prisma.store.create({
      data: {
        name,
        description,
        imageUrl,
        ownerId: req.user.id
      }
    });

    res.status(201).json(newStore);
  } catch (error) {
    console.error("❌ Error creating store:", error);
    res.status(500).json({ message: '创建店铺失败' });
  }
});

/**
 * 🔹 更新店铺信息 (PUT /api/stores/:id)
 * 只允许店铺所有者或管理员
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, imageUrl } = req.body;
    
    // 获取店铺信息
    const store = await prisma.store.findUnique({ where: { id } });
    
    if (!store) {
      return res.status(404).json({ message: '店铺不存在' });
    }
    
    // 检查权限
    if (store.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: '权限不足，只有店铺所有者可以更新店铺信息' });
    }
    
    // 准备更新数据
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    
    // 更新店铺
    const updatedStore = await prisma.store.update({
      where: { id },
      data: updateData
    });
    
    res.json(updatedStore);
  } catch (error) {
    console.error("❌ Error updating store:", error);
    res.status(500).json({ message: '更新店铺信息失败' });
  }
});

/**
 * 🔹 删除店铺 (DELETE /api/stores/:id)
 * 只允许店铺所有者或管理员
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 获取店铺信息
    const store = await prisma.store.findUnique({ where: { id } });
    
    if (!store) {
      return res.status(404).json({ message: '店铺不存在' });
    }
    
    // 检查权限
    if (store.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: '权限不足，只有店铺所有者可以删除店铺' });
    }
    
    // 删除店铺（Prisma会自动级联删除关联的产品）
    await prisma.store.delete({ where: { id } });
    
    res.json({ message: '店铺已成功删除' });
  } catch (error) {
    console.error("❌ Error deleting store:", error);
    res.status(500).json({ message: '删除店铺失败' });
  }
});

/**
 * 🔹 创建店铺评价 (POST /api/stores/:id/reviews)
 * 只允许非店铺所有者的已登录用户
 */
router.post('/:id/reviews', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    
    // 检查必填字段
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: '评分必须在1-5之间' });
    }
    
    // 获取店铺信息
    const store = await prisma.store.findUnique({ where: { id } });
    
    if (!store) {
      return res.status(404).json({ message: '店铺不存在' });
    }
    
    // 店铺所有者不能评价自己的店铺
    if (store.ownerId === req.user.id) {
      return res.status(403).json({ message: '店铺所有者不能评价自己的店铺' });
    }
    
    // 检查用户是否已经评价过该店铺
    const existingReview = await prisma.review.findFirst({
      where: {
        storeId: id,
        userId: req.user.id
      }
    });
    
    if (existingReview) {
      return res.status(400).json({ message: '您已经评价过该店铺' });
    }
    
    // 创建评价
    const newReview = await prisma.review.create({
      data: {
        rating,
        comment,
        userId: req.user.id,
        storeId: id
      }
    });
    
    // 更新店铺的平均评分
    const storeReviews = await prisma.review.findMany({
      where: { storeId: id },
      select: { rating: true }
    });
    
    const avgRating = storeReviews.reduce((sum, review) => sum + review.rating, 0) / storeReviews.length;
    
    await prisma.store.update({
      where: { id },
      data: { rating: avgRating }
    });
    
    res.status(201).json(newReview);
  } catch (error) {
    console.error("❌ Error creating review:", error);
    res.status(500).json({ message: '创建评价失败' });
  }
});

module.exports = router; 