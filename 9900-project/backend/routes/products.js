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
 * 🔹 获取所有产品 (GET /api/products)
 * 公开接口，可搜索和过滤
 */
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      category, 
      minPrice, 
      maxPrice, 
      sort = 'price_asc',
      page = 1, 
      limit = 20 
    } = req.query;

    // 构建过滤条件
    const where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (category) {
      where.category = category;
    }
    
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // 构建排序条件
    let orderBy = {};
    switch (sort) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'name_asc':
        orderBy = { name: 'asc' };
        break;
      case 'name_desc':
        orderBy = { name: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      default:
        orderBy = { price: 'asc' };
    }

    // 分页
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // 查询产品
    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        store: {
          select: {
            id: true,
            name: true,
            rating: true
          }
        }
      }
    });

    // 获取总数
    const total = await prisma.product.count({ where });

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({ message: '获取产品列表失败' });
  }
});

/**
 * 🔹 获取产品详情 (GET /api/products/:id)
 * 公开接口
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            description: true,
            rating: true,
            owner: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ message: '产品不存在' });
    }

    res.json(product);
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    res.status(500).json({ message: '获取产品详情失败' });
  }
});

/**
 * 🔹 创建产品 (POST /api/products)
 * 需要店铺所有者权限
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { storeId, name, description, price, quantity, imageUrl, category } = req.body;
    
    // 检查必填字段
    if (!storeId || !name || price === undefined) {
      return res.status(400).json({ message: '店铺ID、名称和价格是必填项' });
    }

    // 检查价格是否有效
    if (isNaN(price) || price < 0) {
      return res.status(400).json({ message: '价格必须是正数' });
    }

    // 获取店铺信息
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    
    if (!store) {
      return res.status(404).json({ message: '店铺不存在' });
    }
    
    // 检查是否为店铺所有者
    if (store.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: '权限不足，只有店铺所有者可以添加产品' });
    }
    
    // 创建产品
    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        quantity: quantity ? parseInt(quantity) : 0,
        imageUrl,
        category,
        storeId
      }
    });
    
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("❌ Error creating product:", error);
    res.status(500).json({ message: '创建产品失败' });
  }
});

/**
 * 🔹 更新产品 (PUT /api/products/:id)
 * 需要店铺所有者权限
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, quantity, imageUrl, category } = req.body;
    
    // 获取产品和店铺信息
    const product = await prisma.product.findUnique({
      where: { id },
      include: { store: true }
    });
    
    if (!product) {
      return res.status(404).json({ message: '产品不存在' });
    }
    
    // 检查权限
    if (product.store.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: '权限不足，只有店铺所有者可以更新产品' });
    }
    
    // 准备更新数据
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) {
      if (isNaN(price) || price < 0) {
        return res.status(400).json({ message: '价格必须是正数' });
      }
      updateData.price = parseFloat(price);
    }
    if (quantity !== undefined) updateData.quantity = parseInt(quantity);
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (category) updateData.category = category;
    
    // 更新产品
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData
    });
    
    res.json(updatedProduct);
  } catch (error) {
    console.error("❌ Error updating product:", error);
    res.status(500).json({ message: '更新产品失败' });
  }
});

/**
 * 🔹 删除产品 (DELETE /api/products/:id)
 * 需要店铺所有者权限
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 获取产品和店铺信息
    const product = await prisma.product.findUnique({
      where: { id },
      include: { store: true }
    });
    
    if (!product) {
      return res.status(404).json({ message: '产品不存在' });
    }
    
    // 检查权限
    if (product.store.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: '权限不足，只有店铺所有者可以删除产品' });
    }
    
    // 删除产品
    await prisma.product.delete({ where: { id } });
    
    res.json({ message: '产品已成功删除' });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    res.status(500).json({ message: '删除产品失败' });
  }
});

/**
 * 🔹 获取产品类别列表 (GET /api/products/categories)
 * 公开接口
 */
router.get('/categories', async (req, res) => {
  try {
    // 返回所有可用的产品类别 - 已更新为客户需要的类别
    res.json({
      categories: [
        'WHEAT',      // 小麦
        'SUGAR_CANE', // 甘蔗
        'LENTILS',    // 扁豆
        'FRUIT',      // 水果
        'VEGGIE'      // 蔬菜
      ]
    });
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    res.status(500).json({ message: '获取产品类别失败' });
  }
});

module.exports = router; 