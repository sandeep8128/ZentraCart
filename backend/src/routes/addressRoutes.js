const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  addAddress,
  getMyAddresses,
  deleteAddress,
} = require("../controllers/addressController");

router.post(
  "/add",
  authMiddleware,
  addAddress
);

router.get(
  "/my-addresses",
  authMiddleware,
  getMyAddresses
);

router.delete(
  "/:id",
  authMiddleware,
  deleteAddress
);

module.exports = router;