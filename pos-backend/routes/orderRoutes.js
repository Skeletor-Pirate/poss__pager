const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

console.log("✅ Order Routes Loaded");

// 1. Create Order
router.post('/', authMiddleware, orderController.createOrder);

// 2. Get Active Orders
router.get('/', authMiddleware, orderController.getActiveOrders);

// 3. Delete Order (Complete)
router.delete('/:id', authMiddleware, orderController.deleteOrder);

module.exports = router;