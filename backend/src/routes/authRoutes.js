const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const {
  register,
  login,
  changePassword,
  updateProfile,
} = require("../controllers/authController");

router.post("/register", register);

router.post("/login", login);

router.put("/change-password", authMiddleware, changePassword);

router.put("/update-profile", authMiddleware, updateProfile);

module.exports = router;
