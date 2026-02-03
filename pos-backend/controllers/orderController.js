const orderModel = require("../models/orderModel");
const storeSettingsModel = require("../models/settingsModel");
const db = require("../db");
const QRCode = require("qrcode");

// ---------------- CREATE ORDER ----------------
exports.createOrder = async (req, res) => {
  const { items, paymentMethod } = req.body;
  const restaurantId = req.user.restaurantId;

  if (!items || !items.length) {
    return res.status(400).json({ message: "No items" });
  }

  const total = items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  // SIMPLE pager token generation (incremental)
  const [[{ maxToken }]] = await db.query(
    `SELECT MAX(token) AS maxToken FROM orders WHERE restaurant_id = ?`,
    [restaurantId]
  );

  const token = (maxToken || 0) + 1;

  const orderId = await orderModel.createOrder({
    restaurantId,
    total,
    paymentMethod,
    token
  });

  for (const item of items) {
    await orderModel.addOrderItem({
      orderId,
      productId: item.productId,
      price: item.price,
      quantity: item.quantity
    });
  }

  let upi = null;

  if (paymentMethod === "upi") {
    const settings = await storeSettingsModel.getSettings(restaurantId);

    if (!settings) {
      return res.status(500).json({ message: "UPI not configured" });
    }

    const upiLink = `upi://pay?pa=${settings.upi_id}&pn=${encodeURIComponent(
      settings.payee_name
    )}&am=${total}&cu=INR&tr=ORD${orderId}`;

    upi = {
      link: upiLink,
      qr: await QRCode.toDataURL(upiLink)
    };
  }

  res.json({ orderId, token, total, upi });
};

// ---------------- GET ACTIVE ORDERS (KITCHEN) ----------------
exports.getActiveOrders = async (req, res) => {
  const restaurantId = req.user.restaurantId;

  const [orders] = await db.query(
    `
    SELECT id, total, payment_method, payment_status, token, created_at
    FROM orders
    WHERE restaurant_id = ?
      AND payment_status = 'pending'
    ORDER BY created_at ASC
    `,
    [restaurantId]
  );

  res.json(orders);
};

// ---------------- COMPLETE ORDER ----------------
exports.completeOrder = async (req, res) => {
  const restaurantId = req.user.restaurantId;
  const orderId = req.params.id;

  await orderModel.markOrderPaid(orderId, restaurantId);

  res.json({ message: "Order marked as paid" });
};