const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

/**
 * 🔹 搜索功能 (GET /api/search)
 * 支持搜索产品、商店和用户
 */
router.get('/', async (req, res) => {
  try {
    const { 
      query,           // 搜索关键词
      type,           // 搜索类型：'products', 'stores', 'users'
      category,       // 产品类别
      minPrice,       // 最低价格
      maxPrice,       // 最高价格
      rating,         // 最低评分
      sort,           // 排序方式：'default', 'price-low-high', 'price-high-low'
      page = 1,       // 页码
      limit = 9       // 每页数量，默认9个产品
    } = req.query;

    // 验证搜索类型
    if (!['products', 'stores', 'users'].includes(type)) {
      return res.status(400).json({ message: 'Invalid search type' });
    }

    // 计算分页
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    let results = [];
    let total = 0;

    // 根据类型执行不同的搜索
    switch (type) {
      case 'products':
        // 构建产品搜索条件
        const productWhere = {
          AND: [
            query ? {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } }
              ]
            } : {},
            category ? { 
              category: {
                equals: category.toUpperCase(),
                mode: 'insensitive'
              }
            } : {},
            minPrice || maxPrice ? {
              price: {
                ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
                ...(maxPrice ? { lte: parseFloat(maxPrice) } : {})
              }
            } : {}
          ]
        };

        // 构建排序条件
        let orderBy = {};
        switch (sort) {
          case 'price-low-high':
            orderBy = { price: 'asc' };
            break;
          case 'price-high-low':
            orderBy = { price: 'desc' };
            break;
          default:
            orderBy = { createdAt: 'desc' };
        }

        // 搜索产品
        [results, total] = await Promise.all([
          prisma.product.findMany({
            where: productWhere,
            include: {
              store: {
                select: {
                  id: true,
                  name: true,
                  rating: true,
                  owner: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              }
            },
            orderBy,
            skip,
            take
          }),
          prisma.product.count({ where: productWhere })
        ]);

        // 格式化产品数据以匹配前端需求
        results = results.map(product => ({
          id: product.id,
          name: product.name,
          imageUrl: product.imageUrl,
          price: product.price,
          category: product.category.toLowerCase(),
          storeId: product.store.id,
          farmer: product.store.owner.name,
          description: product.description
        }));
        break;

      case 'stores':
        // 构建商店搜索条件
        const storeWhere = {
          AND: [
            query ? {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } }
              ]
            } : {},
            rating ? { rating: { gte: parseFloat(rating) } } : {}
          ]
        };

        // 搜索商店
        [results, total] = await Promise.all([
          prisma.store.findMany({
            where: storeWhere,
            include: {
              owner: {
                select: {
                  id: true,
                  name: true
                }
              },
              _count: {
                select: {
                  products: true,
                  reviews: true
                }
              }
            },
            orderBy: {
              rating: 'desc'
            },
            skip,
            take
          }),
          prisma.store.count({ where: storeWhere })
        ]);
        break;

      case 'users':
        // 构建用户搜索条件
        const userWhere = {
          AND: [
            query ? {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } }
              ]
            } : {}
          ]
        };

        // 搜索用户
        [results, total] = await Promise.all([
          prisma.user.findMany({
            where: userWhere,
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              createdAt: true
            },
            orderBy: {
              createdAt: 'desc'
            },
            skip,
            take
          }),
          prisma.user.count({ where: userWhere })
        ]);
        break;
    }

    res.json({
      results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("❌ Search Error:", error);
    res.status(500).json({ message: 'Failed to perform search' });
  }
});

/**
 * 🔹 获取搜索建议 (GET /api/search/suggestions)
 * 根据关键词提供搜索建议
 */
router.get('/suggestions', async (req, res) => {
  try {
    const { query, type } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    let suggestions = [];

    switch (type) {
      case 'products':
        suggestions = await prisma.product.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } }
            ]
          },
          select: {
            id: true,
            name: true,
            category: true,
            price: true,
            imageUrl: true
          },
          take: 5
        });
        break;

      case 'stores':
        suggestions = await prisma.store.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } }
            ]
          },
          select: {
            id: true,
            name: true,
            rating: true,
            imageUrl: true
          },
          take: 5
        });
        break;
    }

    res.json({ suggestions });
  } catch (error) {
    console.error("❌ Suggestions Error:", error);
    res.status(500).json({ message: 'Failed to get suggestions' });
  }
});

module.exports = router; 