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
    return res.status(401).json({ message: 'Authentication token not provided' });
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
 * 🔹 Get current user's cart (GET /api/cart)
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
    console.error("❌ Failed to retrieve cart:", error);
    res.status(500).json({ message: 'Failed to retrieve cart' });
  }
});

/**
 * 🔹 Add product to cart (POST /api/cart)
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity <= 0) {
      return res.status(400).json({ message: 'Product ID and quantity must be valid' });
    }

    // Check if the product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if the product is already in the cart
    const existingCartItem = await prisma.cart.findFirst({
      where: { customerId: req.user.id, productId }
    });

    if (existingCartItem) {
      // Update quantity
      const updatedCart = await prisma.cart.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity }
      });
      return res.json(updatedCart);
    } else {
      // Create a new cart item
      const newCartItem = await prisma.cart.create({
        data: { customerId: req.user.id, productId, quantity }
      });
      return res.status(201).json(newCartItem);
    }
  } catch (error) {
    console.error("❌ Failed to add to cart:", error);
    res.status(500).json({ message: 'Failed to add to cart' });
  }
});

/**
 * 🔹 Remove product from cart (DELETE /api/cart/:id)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the cart item exists
    const cartItem = await prisma.cart.findUnique({ where: { id } });
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Ensure the user can only delete their own cart items
    if (cartItem.customerId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to delete this cart item' });
    }

    // Delete cart item
    await prisma.cart.delete({ where: { id } });

    res.json({ message: 'Cart item deleted' });
  } catch (error) {
    console.error("❌ Failed to delete cart item:", error);
    res.status(500).json({ message: 'Failed to delete cart item' });
  }
});

module.exports = router;
