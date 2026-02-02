const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Public
router.post("/signup", authController.signup);
router.post("/login", authController.login);

// Admin-only
router.post(
  "/users",
  authMiddleware,
  authorizeRoles("admin"),
  authController.createStaff
);

router.get(
  "/users",
  authMiddleware,
  authorizeRoles("admin"),
  authController.getAllUsers
);

router.delete(
  "/users/:id",
  authMiddleware,
  authorizeRoles("admin"),
  authController.deleteUser
);

module.exports = router;