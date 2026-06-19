const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createRazorpayOrder,
  verifyPayment,
  getMyPayments,
} = require("../controllers/paymentController");

// Create Razorpay Order

router.post(
  "/create-order",
  authMiddleware,
  createRazorpayOrder
);

// Verify Payment

router.post(
  "/verify",
  authMiddleware,
  verifyPayment
);

// My Payments

router.get(
  "/my-payments",
  authMiddleware,
  getMyPayments
);

module.exports = router;