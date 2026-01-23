const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderController");
console.log("✅ orderRoutes loaded");
router.post("/", orderController.createOrder);

module.exports = router;