const db = require('../db');

const orderModel = {
    // 1. Create Order
    createOrder: (total, method, token, subtotal, discount, taxAmount) => {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO orders 
                (total_amount, payment_method, token, subtotal, discount, tax_amount, status, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())
            `;
            db.query(query, [total, method, token, subtotal, discount, taxAmount], (err, result) => {
                if (err) return reject(err);
                resolve(result.insertId);
            });
        });
    },

    // 2. Add Items
    addOrderItem: (orderId, item) => {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO order_items (order_id, product_id, product_name, price, quantity) VALUES (?, ?, ?, ?, ?)`;
            db.query(query, [orderId, item.productId, item.name, item.price, item.quantity], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    },

    // 3. Complete Order (Updates status, does NOT delete)
    completeOrder: (orderId) => {
    return new Promise((resolve, reject) => {
        // OLD (Bad): const query = "DELETE FROM orders WHERE id = ?";
        
        // NEW (Good): Updates status to 'completed', keeps the data
        const query = `UPDATE orders SET status = 'completed', completed_at = NOW() WHERE id = ?`;
        
        db.query(query, [orderId], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
},
    // 4. Get History (Fetch Completed Orders)
    getCompletedOrders: () => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT o.id, o.token, o.created_at, o.completed_at, o.total_amount, 
                       o.payment_method, o.subtotal, o.discount, o.tax_amount,
                       oi.product_name, oi.quantity
                FROM orders o
                LEFT JOIN order_items oi ON o.id = oi.order_id
                WHERE o.status = 'completed'
                ORDER BY o.created_at DESC
            `;
            db.query(query, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }
};

module.exports = orderModel;