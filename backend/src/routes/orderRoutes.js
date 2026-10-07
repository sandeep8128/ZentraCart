const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createOrder,
  getMyOrders,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
  downloadInvoice,
  getSellerOrders,
} = require("../controllers/orderController");

// Create Order

router.post("/create", authMiddleware, createOrder);

// Get My Orders

router.get("/my-orders", authMiddleware, getMyOrders);

router.put("/status/:id", authMiddleware, updateOrderStatus);

router.put("/cancel/:id", authMiddleware, cancelOrder);

router.delete("/delete/:id", authMiddleware, deleteOrder);

// Download Invoice

router.get("/invoice/:id", authMiddleware, downloadInvoice);

router.get("/seller-orders", authMiddleware, getSellerOrders);

module.exports = router;
