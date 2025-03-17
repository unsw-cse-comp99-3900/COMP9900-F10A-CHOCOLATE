const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

/**
 * 🔹 获取所有用户 (GET /api/users)
 */
router.get('/', async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        console.error("❌ Error fetching users:", error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

/**
 * 🔹 用户注册 (POST /api/users/register)
 */
router.post('/register', async (req, res) => {
    console.log("📢 Received Register Request:", req.body);

    const { email, password } = req.body;

    try {
        const newUser = await prisma.user.create({
            data: { email, password }
        });
        console.log("✅ User Registered:", newUser);
        res.json(newUser);
    } catch (error) {
        console.error("❌ Registration Error:", error);
        res.status(400).json({ message: 'User already exists' });
    }
});

/**
 * 🔹 用户登录 (POST /api/users/login)
 */
router.post('/login', async (req, res) => {
    console.log("📢 Received Login Request:", req.body);

    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            console.log("❌ User not found!");
            return res.status(400).json({ message: 'User not found' });
        }

        if (user.password !== password) {
            console.log("❌ Incorrect password!");
            return res.status(400).json({ message: 'Incorrect password' });
        }

        console.log("✅ Login successful:", user);
        res.json({ message: "Login successful", user });
    } catch (error) {
        console.error("❌ Login Error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
