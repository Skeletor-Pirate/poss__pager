const orderModel = require('../models/orderModel');

async function createOrder(req, res) {
  const { items, paymentMethod } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ message: "No items" });
  }

  if (!['upi', 'cash', 'card'].includes(paymentMethod)) {
    return res.status(400).json({ message: "Invalid payment method" });
  }

  try {
    const total = items.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );

    const orderId = await orderModel.createOrder(total, paymentMethod);

    for (const item of items) {
      await orderModel.addOrderItem(orderId, item);
    }

    res.json({
      message: "Order created",
      orderId,
      total,
      paymentStatus: "pending"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { createOrder };