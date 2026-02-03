const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");

console.log("✅ Order Routes Loaded");

router.post("/", authMiddleware, orderController.createOrder);
router.get("/", authMiddleware, orderController.getActiveOrders);
router.put("/:id/complete", authMiddleware, orderController.completeOrder);

module.exports = router;