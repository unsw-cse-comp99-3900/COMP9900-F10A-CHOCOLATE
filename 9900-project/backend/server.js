require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/users');

const app = express();
app.use(express.json());
app.use(cors());

// 用户 API
app.use('/api/users', userRoutes);

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
