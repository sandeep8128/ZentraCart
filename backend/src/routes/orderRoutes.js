const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createOrder,
  getMyOrders,
  updateOrderStatus,
  cancelOrder,
} = require("../controllers/orderController");

// Create Order

router.post("/create", authMiddleware, createOrder);



// Get My Orders

router.get("/my-orders", authMiddleware, getMyOrders);

router.put("/status/:id", authMiddleware, updateOrderStatus);

router.put(
  "/cancel/:id",
  authMiddleware,
  cancelOrder
);

module.exports = router;
