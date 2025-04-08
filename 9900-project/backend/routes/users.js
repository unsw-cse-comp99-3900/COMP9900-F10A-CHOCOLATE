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

    // Create JWT token for automatic login after registration
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    // Exclude password from response
    const { password: _, ...userWithoutPassword } = newUser;
    console.log("✅ User Registered:", userWithoutPassword);
    
    // Return token along with user data
    res.status(201).json({
      user: userWithoutPassword,
      token,
      message: "Registration successful"
    });
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

  const { email, password, role } = req.body;
  
  try {
    // Check required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.log(" User not found!");
      return res.status(400).json({ message: 'User does not exist' });
    }

    // check role
    if (user.role !== role) {
      console.log(` Role mismatch! Registered as '${user.role}', attempted login as '${role}'`);
      return res.status(403).json({ 
        message: `This account is registered as '${user.role}', not '${role}'`
      });
    }

    // verify password (hashed password)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
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
 * 🔹 Update user profile (PUT /api/users/:id)
 * Users can update their own profile, admins can update any profile
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, currentPassword, newPassword } = req.body;
    
    // Verify permissions
    if (req.user.id !== id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // Get current user data
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prepare update data
    const updateData = {};
    
    // Validate and update basic info
    if (name !== undefined) {
      if (name.length < 2 || name.length > 50) {
        return res.status(400).json({ message: 'Name must be between 2 and 50 characters' });
      }
      updateData.name = name;
    }

    if (email !== undefined) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }

      // Check if email is already taken
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: {
            id: id
          }
        }
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already taken' });
      }
      updateData.email = email;
    }

    if (phone !== undefined) {
      // Validate phone format (basic validation)
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ message: 'Invalid phone number format' });
      }
      updateData.phone = phone;
    }

    if (address !== undefined) {
      if (address.length < 5 || address.length > 200) {
        return res.status(400).json({ message: 'Address must be between 5 and 200 characters' });
      }
      updateData.address = address;
    }

    // Handle password change if requested
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to change password' });
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Validate new password
      if (newPassword.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long' });
      }
      if (newPassword === currentPassword) {
        return res.status(400).json({ message: 'New password must be different from current password' });
      }

      // Hash new password
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    // Add updatedAt timestamp
    updateData.updatedAt = new Date();

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

    res.json({
      user: updatedUser,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error("❌ Error updating user:", error);
    res.status(500).json({ message: 'Failed to update user profile' });
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