const db = require('../db');
const orderModel = require('../models/orderModel');

// 1. Create Order
async function createOrder(req, res) {
  const { items, paymentMethod, financials, token } = req.body;

  if (!items || items.length === 0) {
      return res.status(400).json({ message: "Invalid order data" });
  }

  const method = String(paymentMethod || 'cash').toLowerCase();

  try {
    const total = financials ? Number(financials.finalPayable) : 0;
    const subtotal = financials ? Number(financials.subtotal) : 0;
    const discount = financials ? Number(financials.discount) : 0;
    const taxAmount = financials ? Number(financials.taxAmount) : 0;
    
    // Save Order
    const orderId = await orderModel.createOrder(total, method, token, subtotal, discount, taxAmount);
    
    // Save Items
    const itemPromises = items.map(item => 
        orderModel.addOrderItem(orderId, {
            productId: item.productId ?? item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
        })
    );
    await Promise.all(itemPromises);

    res.json({ message: "Success", orderId, token });

  } catch (err) {
    console.error("❌ Order Error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// 2. Get Active Orders
async function getActiveOrders(req, res) {
    const query = `
        SELECT o.id, o.token, o.created_at, o.total_amount, o.payment_method, 
               o.subtotal, o.discount, o.tax_amount, oi.product_name, oi.quantity 
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        ORDER BY o.created_at ASC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Fetch Error:", err);
            return res.status(500).json([]);
        }
        
        const ordersMap = {};
        results.forEach(row => {
            if (!ordersMap[row.id]) {
                ordersMap[row.id] = {
                    id: row.id,
                    token: row.token,
                    startedAt: row.created_at,
                    total: row.total_amount,
                    paymentMethod: row.payment_method,
                    items: []
                };
            }
            if (row.product_name) {
                ordersMap[row.id].items.push({ name: row.product_name, quantity: row.quantity });
            }
        });
        res.json(Object.values(ordersMap));
    });
}

// 3. DELETE Order (The "Reset" Button)
async function deleteOrder(req, res) {
    const orderId = req.params.id;
    
    // Delete items first
    db.query('DELETE FROM order_items WHERE order_id = ?', [orderId], (err) => {
        if (err) {
            console.error("Delete Items Error:", err);
            return res.status(500).json({ message: "DB Error" });
        }
        // Then delete order
        db.query('DELETE FROM orders WHERE id = ?', [orderId], (err2) => {
            if (err2) {
                console.error("Delete Order Error:", err2);
                return res.status(500).json({ message: "DB Error" });
            }
            res.json({ msg: "Order Deleted" });
        });
    });
}

module.exports = { createOrder, getActiveOrders, deleteOrder };