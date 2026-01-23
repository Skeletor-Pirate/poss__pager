const express = require('express');
const app = express();

const productRoutes = require('./routes/products');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');

const authMiddleware = require('./middleware/authMiddleware');
const cors = require('cors');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Point of Sale Backend is running');
});

app.use('/auth', authRoutes);
app.use('/products', authMiddleware, productRoutes);
app.use('/orders', authMiddleware, orderRoutes);  // IMPORTANT

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});