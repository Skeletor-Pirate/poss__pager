const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// 1. Create
router.post('/', orderController.createOrder);

// 2. Get All Active
router.get('/', orderController.getActiveOrders);

// 3. Delete (Mark Ready)
router.delete('/:id', orderController.deleteOrder);

module.exports = router;