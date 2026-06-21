const express = require("express");

const router = express.Router();
const upload = require("../middleware/upload");

const authMiddleware = require("../middleware/authMiddleware");

const {
  addReview,
  getProductReviews,
  deleteReview,
} = require("../controllers/reviewController");

// Add Review

router.post(
  "/:productId",
  authMiddleware,
  upload.array("images", 3),
  addReview,
);

// Get Reviews

router.get(
  "/:productId",

  getProductReviews,
);

// Delete Review

router.delete(
  "/:id",

  authMiddleware,

  deleteReview,
);

module.exports = router;
