const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
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
 * 🔹 Get all users (GET /api/users)
 * Requires admin privileges
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Check if user is an admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Permission denied' });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        address: true,
        createdAt: true
      }
    });
    res.json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ message: 'Failed to retrieve user data' });
  }
});

/**
 * 🔹 Get user details (GET /api/users/:id)
 * Users can retrieve their own details, admins can retrieve any user details
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify permissions
    if (req.user.id !== id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Permission denied' });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        address: true,
        createdAt: true,
        stores: req.user.role === 'FARMER' ? {
          select: {
            id: true,
            name: true,
            rating: true
          }
        } : undefined,
        orders: req.user.role === 'CUSTOMER' ? {
          select: {
            id: true,
            totalAmount: true,
            status: true,
            createdAt: true
          }
        } : undefined
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    res.status(500).json({ message: 'Failed to retrieve user data' });
  }
});

/**
 * 🔹 User registration (POST /api/users/register)
 */
router.post('/register', async (req, res) => {
  console.log("📢 Received Register Request:", req.body);
  
  try {
    const { email, password, name, phone, address, role } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if email is already registered
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Default role is CUSTOMER unless specified and valid
    let userRole = 'CUSTOMER';
    if (role === 'FARMER') {
      userRole = 'FARMER';
    }
    // Admin role cannot be created through API, must be set directly in the database

    const newUser = await prisma.user.create({
      data: { 
        email, 
        password: hashedPassword, 
        name, 
        phone, 
        address,
        role: userRole
      }
    });

    // Exclude password from response
    const { password: _, ...userWithoutPassword } = newUser;
    console.log("✅ User Registered:", userWithoutPassword);
    
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

/**
 * 🔹 User login (POST /api/users/login)
 */
router.post('/login', async (req, res) => {
  console.log("📢 Received Login Request:", req.body);

  const { email, password } = req.body;

  try {
    // Check required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.log("❌ User not found!");
      return res.status(400).json({ message: 'User does not exist' });
    }

    // Verify password
    if (password !== user.password) {
      console.log("❌ Incorrect password!");
      return res.status(400).json({ message: 'Incorrect password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    // Exclude password from response
    const { password: _, ...userWithoutPassword } = user;
    
    console.log("✅ Login successful:", userWithoutPassword);
    res.json({
      message: "Login successful",
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * 🔹 Update user information (PUT /api/users/:id)
 * Users can update their own information, admins can update any user's information
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, address, password } = req.body;
    
    // Verify permissions
    if (req.user.id !== id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        address: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("❌ Update User Error:", error);
    res.status(500).json({ message: 'Failed to update user information' });
  }
});

/**
 * 🔹 Delete user (DELETE /api/users/:id)
 * Users can delete their own accounts, admins can delete any user
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify permissions
    if (req.user.id !== id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // Delete user
    await prisma.user.delete({ where: { id } });

    res.json({ message: 'User successfully deleted' });
  } catch (error) {
    console.error("❌ Delete User Error:", error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

module.exports = router;
