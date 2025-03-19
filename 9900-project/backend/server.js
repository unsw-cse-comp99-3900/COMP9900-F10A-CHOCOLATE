require('dotenv').config();
const express = require('express');
const cors = require('cors');

// 引入路由
const userRoutes = require('./routes/users');
const storeRoutes = require('./routes/stores');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');

const app = express();

// 中间件
app.use(express.json());
app.use(cors());

// API路由注册
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);

// 根路由
app.get('/', (req, res) => {
  res.json({ message: '欢迎使用农民市场API' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ 
    message: '服务器发生错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 启动服务器
const PORT = process.env.PORT || 5004;
app.listen(PORT, () => {
  console.log(`服务器已在端口 ${PORT} 上启动`);
});

