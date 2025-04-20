const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const router = express.Router();

/**
 * 🔹 Create admin account (POST /api/admin/setup)
 * This route should only be called once to set up the initial admin account
 */
router.post('/setup', async (req, res) => {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin account already exists' });
    }

    // Create admin account with default credentials
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@farmersmarket.com',
        password: hashedPassword,
        name: 'System Administrator',
        role: 'ADMIN',
        phone: '0000000000',
        address: 'System'
      }
    });

    // Create token for immediate login
    const token = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: adminUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...adminWithoutPassword } = adminUser;

    res.status(201).json({
      message: 'Admin account created successfully',
      user: adminWithoutPassword,
      token
    });
  } catch (error) {
    console.error('❌ Error creating admin account:', error);
    res.status(500).json({ message: 'Failed to create admin account' });
  }
});

module.exports = router; 