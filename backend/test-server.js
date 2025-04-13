const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'Test server is working!' });
});

const PORT = 5003;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server is running on port ${PORT}`);
}); 