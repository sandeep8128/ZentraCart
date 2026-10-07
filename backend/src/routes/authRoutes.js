const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const {
  register,
  login,
  updateLocation,
  getLocation,
  clearLocation,
  changePassword,
  updateProfile,
  becomeSeller,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

// ==========================
// AUTH
// ==========================

router.post("/register", register);

router.post("/login", login);

// ==========================
// LOCATION
// ==========================

// Save / update user's current location
router.put("/location", authMiddleware, updateLocation);

// Get user's saved location
router.get("/location", authMiddleware, getLocation);

// Clear / remove saved location
router.delete("/location", authMiddleware, clearLocation);

// ==========================
// PROFILE
// ==========================

router.put("/change-password", authMiddleware, changePassword);

router.put("/update-profile", authMiddleware, updateProfile);

router.put("/become-seller", authMiddleware, becomeSeller);

// ==========================
// PASSWORD RESET
// ==========================

router.post("/forgot-password", forgotPassword);

router.put("/reset-password/:token", resetPassword);

module.exports = router;
