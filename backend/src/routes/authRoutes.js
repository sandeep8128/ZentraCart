const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const {
  register,
  login,
  changePassword,
  updateProfile,
  becomeSeller,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

router.post("/register", register);

router.post("/login", login);

router.put("/change-password", authMiddleware, changePassword);

router.put("/update-profile", authMiddleware, updateProfile);

router.put("/become-seller", authMiddleware, becomeSeller);

router.post("/forgot-password", forgotPassword);

router.put("/reset-password/:token", resetPassword);

module.exports = router;
