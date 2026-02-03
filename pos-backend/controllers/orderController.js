const storeSettingsModel = require("../models/settingsModel");
const db = require("../db");
const QRCode = require("qrcode");

// ---------------- CREATE ORDER ----------------
exports.createOrder = async (req, res) => {
  try {
    const { items, paymentMethod } = req.body;
    const restaurantId = req.user.restaurantId;

    if (!items || !items.length) {
      return res.status(400).json({ message: "No items" });
    }

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    // 1. GENERATE TOKEN (If column exists)
    let token = 1;
    try {
        const [[{ maxToken }]] = await db.query(
          `SELECT MAX(token) AS maxToken FROM orders WHERE restaurant_id = ?`,
          [restaurantId]
        );
        token = (maxToken || 0) + 1;
    } catch (err) { /* Ignore if token missing */ }

    // 2. INSERT ORDER
    let orderId;
    try {
        // Try inserting with 'token'
        const [result] = await db.query(
          `INSERT INTO orders (restaurant_id, total, payment_method, payment_status, token)
           VALUES (?, ?, ?, 'pending', ?)`,
          [restaurantId, total, paymentMethod, token]
        );
        orderId = result.insertId;
    } catch (err) {
        // Fallback: If 'token' missing, insert without it
        const [result] = await db.query(
          `INSERT INTO orders (restaurant_id, total, payment_method, payment_status)
           VALUES (?, ?, ?, 'pending')`,
          [restaurantId, total, paymentMethod]
        );
        orderId = result.insertId;
        token = orderId; 
    }

    // 3. INSERT ITEMS (MATCHING YOUR DB STRUCTURE)
    // ✅ FIX: Inserting 'name' (Required by your DB)
    // ✅ FIX: Removed 'subtotal' (Your DB does not have this)
    for (const item of items) {
      await db.query(
        `INSERT INTO order_items (order_id, product_id, name, price, quantity)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.productId, item.name || 'Item', item.price, item.quantity]
      );
    }

    // 4. GENERATE QR CODE
    let upi = null;
    if (paymentMethod === "upi") {
      const [settingsRows] = await db.query(
          `SELECT upi_id, payee_name FROM store_settings WHERE restaurant_id = ?`, 
          [restaurantId]
      );
      const settings = settingsRows[0];

      if (settings && settings.upi_id) {
        const pa = settings.upi_id;
        const pn = encodeURIComponent(settings.payee_name);
        const am = parseFloat(total).toFixed(2);
        const cu = "INR";
        const tr = `ORD${orderId}`;
        const tn = encodeURIComponent(`Order #${token}`);

        const upiLink = `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=${cu}&tr=${tr}&tn=${tn}`;
        
        upi = {
          link: upiLink,
          qr: await QRCode.toDataURL(upiLink)
        };
      }
    }

    res.json({ orderId, token, total, upi });

  } catch (err) {
    console.error("Create Order Error:", err);
    res.status(500).json({ message: "Server Error: " + err.message });
  }
};

// ---------------- GET ACTIVE ORDERS ----------------
exports.getActiveOrders = async (req, res) => {
  const restaurantId = req.user.restaurantId;
  try {
    const [orders] = await db.query(
        `SELECT id, total, payment_method, payment_status, token, created_at
         FROM orders WHERE restaurant_id = ? AND payment_status = 'pending'
         ORDER BY created_at ASC`, [restaurantId]
    );
    res.json(orders);
  } catch (err) {
     const [orders] = await db.query(
        `SELECT id, total, payment_method, payment_status, id as token, created_at
         FROM orders WHERE restaurant_id = ? AND payment_status = 'pending'
         ORDER BY created_at ASC`, [restaurantId]
    );
    res.json(orders);
  }
};

// ---------------- DELETE ORDER (Fixes 404 Error) ----------------
exports.deleteOrder = async (req, res) => {
  const restaurantId = req.user.restaurantId;
  const orderId = req.params.id;
  await db.query("DELETE FROM orders WHERE id = ? AND restaurant_id = ?", [orderId, restaurantId]);
  res.json({ message: "Order completed" });
};