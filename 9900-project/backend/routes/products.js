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
 * 🔹 Get all products (GET /api/products)
 * Public API, supports search and filtering
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

    // Build filter conditions
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

    // Build sorting condition
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

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Query products
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

    // Get total count
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
    res.status(500).json({ message: 'Failed to retrieve product list' });
  }
});

/**
 * 🔹 Get product details (GET /api/products/:id)
 * Public API
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
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    res.status(500).json({ message: 'Failed to retrieve product details' });
  }
});

/**
 * 🔹 Create a product (POST /api/products)
 * Requires store owner permission
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { storeId, name, description, price, quantity, imageUrl, category } = req.body;
    
    // Check required fields
    if (!storeId || !name || price === undefined) {
      return res.status(400).json({ message: 'Store ID, name, and price are required' });
    }

    // Validate price
    if (isNaN(price) || price < 0) {
      return res.status(400).json({ message: 'Price must be a positive number' });
    }

    // Retrieve store information
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    // Check if user is the store owner
    if (store.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Permission denied, only store owners can add products' });
    }
    
    // Create product
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
    res.status(500).json({ message: 'Failed to create product' });
  }
});

/**
 * 🔹 Update a product (PUT /api/products/:id)
 * Requires store owner permission
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, quantity, imageUrl, category } = req.body;
    
    // Retrieve product and store information
    const product = await prisma.product.findUnique({
      where: { id },
      include: { store: true }
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check permissions
    if (product.store.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Permission denied, only store owners can update products' });
    }
    
    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) {
      if (isNaN(price) || price < 0) {
        return res.status(400).json({ message: 'Price must be a positive number' });
      }
      updateData.price = parseFloat(price);
    }
    if (quantity !== undefined) updateData.quantity = parseInt(quantity);
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (category) updateData.category = category;
    
    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData
    });
    
    res.json(updatedProduct);
  } catch (error) {
    console.error("❌ Error updating product:", error);
    res.status(500).json({ message: 'Failed to update product' });
  }
});

/**
 * 🔹 Delete a product (DELETE /api/products/:id)
 * Requires store owner permission
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Retrieve product and store information
    const product = await prisma.product.findUnique({
      where: { id },
      include: { store: true }
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check permissions
    if (product.store.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Permission denied, only store owners can delete products' });
    }
    
    // Delete product
    await prisma.product.delete({ where: { id } });
    
    res.json({ message: 'Product successfully deleted' });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    res.status(500).json({ message: 'Failed to delete product' });
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
