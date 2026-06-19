const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createCoupon,
  getCoupons,
  applyCoupon,
  deleteCoupon,
} = require("../controllers/couponController");

// Create Coupon (Admin)

router.post(
  "/",

  authMiddleware,

  roleMiddleware("admin"),

  createCoupon,
);

// Get Coupons

router.get(
  "/",

  getCoupons,
);

// Apply Coupon

router.post(
  "/apply",

  applyCoupon,
);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteCoupon);

module.exports = router;
