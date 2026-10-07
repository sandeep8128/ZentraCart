const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  addAddress,
  getMyAddresses,
  deleteAddress,
} = require("../controllers/addressController");


// ADD ADDRESS


router.post("/add", authMiddleware, addAddress);


// GET MY ADDRESSES


router.get("/my-addresses", authMiddleware, getMyAddresses);


// DELETE ADDRESS


router.delete("/:id", authMiddleware, deleteAddress);

module.exports = router;
