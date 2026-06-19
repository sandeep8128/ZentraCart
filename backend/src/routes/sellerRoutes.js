const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  getSellerOrders,
  getSellerAnalytics,
  updateOrderStatus,
  deleteOrder
} = require("../controllers/sellerController");

router.get(
  "/orders",

  authMiddleware,

  roleMiddleware("seller"),

  getSellerOrders,
);

router.get(
  "/analytics",

  authMiddleware,

  roleMiddleware("seller"),

  getSellerAnalytics,
);

router.put(
  "/orders/:id",
  authMiddleware,
  roleMiddleware("seller"),
  updateOrderStatus,
);
router.delete(
  "/orders/:id",
  authMiddleware,
  roleMiddleware("seller"),
  deleteOrder
);

module.exports = router;
