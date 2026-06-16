const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {

    addReview,
    getProductReviews,
    deleteReview

} = require("../controllers/reviewController");


// Add Review

router.post(

    "/:productId",

    authMiddleware,

    addReview

);


// Get Reviews

router.get(

    "/:productId",

    getProductReviews

);


// Delete Review

router.delete(

    "/:id",

    authMiddleware,

    deleteReview

);

module.exports = router;