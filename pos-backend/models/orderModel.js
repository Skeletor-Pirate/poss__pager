const db = require("../db");

async function createOrder({ restaurantId, total, paymentMethod, token }) {
  const [result] = await db.query(
    `
    INSERT INTO orders 
    (restaurant_id, total, payment_method, payment_status, token)
    VALUES (?, ?, ?, 'pending', ?)
    `,
    [restaurantId, total, paymentMethod, token]
  );

  return result.insertId;
}

async function addOrderItem({ orderId, productId, price, quantity }) {
  const subtotal = price * quantity;

  await db.query(
    `
    INSERT INTO order_items
    (order_id, product_id, price, quantity, subtotal)
    VALUES (?, ?, ?, ?, ?)
    `,
    [orderId, productId, price, quantity, subtotal]
  );
}

async function markOrderPaid(orderId, restaurantId) {
  await db.query(
    `
    UPDATE orders
    SET payment_status = 'paid'
    WHERE id = ? AND restaurant_id = ?
    `,
    [orderId, restaurantId]
  );
}

module.exports = {
  createOrder,
  addOrderItem,
  markOrderPaid
};