const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
// const upload = require('./upload');
const upload = require('./middleware/upload');

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
 * 🔹 Get all stores (GET /api/stores)
 * Public API, accessible by anyone
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
          take: 5 // Fetch only the first 5 products as a preview
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
    res.status(500).json({ message: 'Failed to retrieve store list' });
  }
});

/**
 * 🔹 Get store details (GET /api/stores/:id)
 * Public API, accessible by anyone
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
          take: 10, // Display only the latest 10 reviews
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.json(store);
  } catch (error) {
    console.error("❌ Error fetching store details:", error);
    res.status(500).json({ message: 'Failed to retrieve store details' });
  }
});

/**
 * 🔹 Create a store (POST /api/stores)
 * Requires farmer role
 */
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  try{
    
  const { name, description } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  if (req.user.role !== 'FARMER' && req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Only farmers can create stores' });
  }

  if (!name) return res.status(400).json({ message: 'Store name is required' });

  const existingStore = await prisma.store.findFirst({
    where: { ownerId: req.user.id }
  });

  if (existingStore) {
    return res.status(400).json({ message: 'You already own a store' });
  }

  const newStore = await prisma.store.create({
    data: {
      name,
      description,
      imageUrl,
      ownerId: req.user.id
    }
  });

  res.status(201).json(newStore);
}
    catch (error) {
    console.error("❌ Error creating store:", error);
    res.status(500).json({ message: 'Failed to create store' });
  }
});

/**
 * 🔹 Update store details (PUT /api/stores/:id)
 * Only store owner or admin can update
 */
  router.put('/:id', authenticateToken, upload.single('image'), async (req, res) => {
    try{
    const { id } = req.params;
    const { name, description } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const store = await prisma.store.findUnique({ where: { id } });
    if (!store) return res.status(404).json({ message: 'Store not found' });

    if (store.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only store owners can update stores' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    const updatedStore = await prisma.store.update({
      where: { id },
      data: updateData
    });

    res.json(updatedStore);
  } catch (error) {
    console.error("❌ Error updating store:", error);
    res.status(500).json({ message: 'Failed to update store' });
  }
});

/**
 * 🔹 Delete a store (DELETE /api/stores/:id)
 * Only store owner or admin can delete
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Retrieve store information
    const store = await prisma.store.findUnique({ where: { id } });
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    // Check permissions
    if (store.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Permission denied, only store owners can delete the store' });
    }
    
    // Delete store (Prisma will automatically cascade delete associated products)
    await prisma.store.delete({ where: { id } });
    
    res.json({ message: 'Store successfully deleted' });
  } catch (error) {
    console.error("❌ Error deleting store:", error);
    res.status(500).json({ message: 'Failed to delete store' });
  }
});

/**
 * 🔹 Create a store review (POST /api/stores/:id/reviews)
 * Only logged-in users who are not the store owner can submit reviews
 */
router.post('/:id/reviews', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    
    // Validate rating range
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    // Retrieve store information
    const store = await prisma.store.findUnique({ where: { id } });
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    // Store owner cannot review their own store
    if (store.ownerId === req.user.id) {
      return res.status(403).json({ message: 'Store owners cannot review their own store' });
    }
    
    // Create review
    const newReview = await prisma.review.create({
      data: {
        rating,
        comment,
        userId: req.user.id,
        storeId: id
      }
    });

    res.status(201).json(newReview);
  } catch (error) {
    console.error("❌ Error creating review:", error);
    res.status(500).json({ message: 'Failed to create review' });
  }
});

module.exports = router;
