const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 产品数据
const products = [
  { id: '1', name: 'Apple', price: 1.99, imageUrl: 'https://placehold.co/400x300?text=Apple', category: 'Fruit', storeId: '1', description: 'Fresh red apples' },
  { id: '2', name: 'Banana', price: 0.99, imageUrl: 'https://placehold.co/400x300?text=Banana', category: 'Fruit', storeId: '1', description: 'Ripe yellow bananas' },
  { id: '3', name: 'Orange', price: 2.49, imageUrl: 'https://placehold.co/400x300?text=Orange', category: 'Fruit', storeId: '2', description: 'Juicy oranges' },
  { id: '4', name: 'Carrot', price: 1.50, imageUrl: 'https://placehold.co/400x300?text=Carrot', category: 'Veggie', storeId: '2', description: 'Fresh carrots' }
];

// 客户数据
const customers = [
  {
    id: '1',
    name: 'Test Customer',
    email: 'customer@example.com',
    address: '123 Test Street, Test City, 12345'
  }
];

// 商店数据
const stores = [
  { 
    id: '1', 
    name: 'Farm Fresh', 
    description: 'Fresh local produce',
    userId: '1',
    imageUrl: 'https://placehold.co/400x300?text=Farm+Fresh',
    products: products.filter(p => p.storeId === '1')
  },
  { 
    id: '2', 
    name: 'Organic Valley', 
    description: 'Organic fruits and vegetables',
    userId: '2',
    imageUrl: 'https://placehold.co/400x300?text=Organic+Valley',
    products: products.filter(p => p.storeId === '2')
  }
];

// 订单数据
const orders = [
  {
    id: '1',
    userId: '1',
    status: 'COMPLETED',
    totalAmount: 12.99,
    createdAt: new Date().toISOString(),
    customer: customers[0],
    items: [
      { id: '1', productId: '1', quantity: 2, price: 1.99, product: products.find(p => p.id === '1') },
      { id: '2', productId: '3', quantity: 1, price: 2.49, product: products.find(p => p.id === '3') }
    ]
  }
];

app.get('/', (req, res) => {
  res.json({ message: 'Simple test server is working!' });
});

app.get('/api/products', (req, res) => {
  // 支持可选的category查询参数
  const { category, limit } = req.query;
  let result = [...products];
  
  if (category) {
    result = result.filter(p => p.category === category);
  }
  
  if (limit) {
    result = result.slice(0, parseInt(limit, 10));
  }
  
  res.json(result);
});

// 根据ID获取产品
app.get('/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

// 添加简单的stores端点
app.get('/stores', (req, res) => {
  res.json(stores);
});

// 获取特定商店
app.get('/stores/:id', (req, res) => {
  const store = stores.find(s => s.id === req.params.id);
  
  if (store) {
    res.json(store);
  } else {
    res.status(404).json({ message: 'Store not found' });
  }
});

// 添加用户登录端点
app.post('/users/login', (req, res) => {
  const { email, password, role } = req.body;
  
  // 简单的测试用户
  if (email && password) {
    // 返回成功登录响应
    res.json({
      token: 'test-token-12345',
      user: {
        id: '1',
        email: email,
        name: 'Test User',
        role: role || 'CUSTOMER'
      }
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// 添加用户注册端点
app.post('/users/register', (req, res) => {
  const { email, password, name, role } = req.body;
  
  if (email && password) {
    res.json({
      token: 'test-token-register-12345',
      user: {
        id: '2',
        email: email,
        name: name || 'New User',
        role: role || 'CUSTOMER'
      }
    });
  } else {
    res.status(400).json({ message: 'Invalid registration data' });
  }
});

// 添加获取用户信息端点
app.get('/users/:id', (req, res) => {
  res.json({
    id: req.params.id,
    email: 'user@example.com',
    name: 'Test User',
    role: 'CUSTOMER'
  });
});

// 添加更新用户信息端点
app.put('/users/:id', (req, res) => {
  res.json({
    id: req.params.id,
    ...req.body
  });
});

// 购物车端点
app.get('/cart', (req, res) => {
  res.json({
    id: '1',
    userId: '1',
    items: [
      { id: '1', productId: '1', quantity: 2, product: products.find(p => p.id === '1') },
      { id: '2', productId: '3', quantity: 1, product: products.find(p => p.id === '3') }
    ]
  });
});

// 添加购物车端点
app.post('/cart', (req, res) => {
  res.json({
    id: '1',
    userId: '1',
    items: [
      { id: '1', productId: '1', quantity: 2, product: products.find(p => p.id === '1') },
      { id: '2', productId: '3', quantity: 1, product: products.find(p => p.id === '3') }
    ]
  });
});

// 添加订单端点
app.get('/orders', (req, res) => {
  // 确保所有订单都有客户信息
  const ordersWithCustomer = orders.map(order => {
    if (!order.customer) {
      return { ...order, customer: customers[0] };
    }
    return order;
  });
  
  res.json(ordersWithCustomer);
});

// 创建订单端点
app.post('/orders', (req, res) => {
  const newOrder = {
    id: (orders.length + 1).toString(),
    userId: '1',
    status: 'PENDING',
    totalAmount: req.body.totalAmount || 10.99,
    createdAt: new Date().toISOString(),
    customer: customers[0],
    items: req.body.items || [
      { id: '1', productId: '1', quantity: 1, price: 1.99, product: products.find(p => p.id === '1') }
    ]
  };
  
  orders.push(newOrder);
  res.json(newOrder);
});

// 添加订单详情端点
app.get('/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  
  if (order) {
    res.json(order);
  } else {
    res.json({
      id: req.params.id,
      userId: '1',
      status: 'COMPLETED',
      totalAmount: 12.99,
      createdAt: new Date().toISOString(),
      customer: customers[0],
      items: [
        { id: '1', productId: '1', quantity: 2, price: 1.99, product: products.find(p => p.id === '1') },
        { id: '2', productId: '3', quantity: 1, price: 2.49, product: products.find(p => p.id === '3') }
      ]
    });
  }
});

const PORT = 5005;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple test server running at http://localhost:${PORT}`);
}); 