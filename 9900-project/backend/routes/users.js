const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
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
 * 🔹 获取所有用户 (GET /api/users)
 * 需要管理员权限
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    // 检查是否为管理员
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: '权限不足' });
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
    res.status(500).json({ message: '获取用户数据失败' });
  }
});

/**
 * 🔹 获取用户详情 (GET /api/users/:id)
 * 用户可以获取自己的详情，管理员可以获取任何用户的详情
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 验证权限
    if (req.user.id !== id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: '权限不足' });
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
        // 如果是农民，包含店铺信息
        stores: req.user.role === 'FARMER' ? {
          select: {
            id: true,
            name: true,
            rating: true
          }
        } : undefined,
        // 如果是顾客，包含订单信息
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
      return res.status(404).json({ message: '用户不存在' });
    }

    res.json(user);
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    res.status(500).json({ message: '获取用户数据失败' });
  }
});

/**
 * 🔹 用户注册 (POST /api/users/register)
 */
router.post('/register', async (req, res) => {
  console.log("📢 Received Register Request:", req.body);
  
  try {
    const { email, password, name, phone, address, role } = req.body;

    // 检查必填字段
    if (!email || !password) {
      return res.status(400).json({ message: '邮箱和密码是必填项' });
    }

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: '该邮箱已被注册' });
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);

    // 默认角色为顾客，除非特别指定且符合规则
    let userRole = 'CUSTOMER';
    if (role === 'FARMER') {
      userRole = 'FARMER';
    }
    // 管理员角色暂不通过API创建，需要在数据库中直接设置

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

    // 不返回密码
    const { password: _, ...userWithoutPassword } = newUser;
    console.log("✅ User Registered:", userWithoutPassword);
    
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.status(500).json({ message: '注册失败', error: error.message });
  }
});

/**
 * 🔹 用户登录 (POST /api/users/login)
 */
router.post('/login', async (req, res) => {
  console.log("📢 Received Login Request:", req.body);

  const { email, password } = req.body;

  try {
    // 检查必填字段
    if (!email || !password) {
      return res.status(400).json({ message: '邮箱和密码是必填项' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.log("❌ User not found!");
      return res.status(400).json({ message: '用户不存在' });
    }

    // 验证密码
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log("❌ Incorrect password!");
      return res.status(400).json({ message: '密码错误' });
    }

    // 创建JWT令牌
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    // 不返回密码
    const { password: _, ...userWithoutPassword } = user;
    
    console.log("✅ Login successful:", userWithoutPassword);
    res.json({
      message: "登录成功",
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: '服务器错误' });
  }
});

/**
 * 🔹 更新用户信息 (PUT /api/users/:id)
 * 用户可以更新自己的信息，管理员可以更新任何用户的信息
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, address, password } = req.body;
    
    // 验证权限
    if (req.user.id !== id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: '权限不足' });
    }

    // 准备更新数据
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // 更新用户
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
    res.status(500).json({ message: '更新用户信息失败' });
  }
});

/**
 * 🔹 删除用户 (DELETE /api/users/:id)
 * 用户可以删除自己的账户，管理员可以删除任何用户
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 验证权限
    if (req.user.id !== id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: '权限不足' });
    }

    // 删除用户
    await prisma.user.delete({ where: { id } });

    res.json({ message: '用户已成功删除' });
  } catch (error) {
    console.error("❌ Delete User Error:", error);
    res.status(500).json({ message: '删除用户失败' });
  }
});

module.exports = router;
