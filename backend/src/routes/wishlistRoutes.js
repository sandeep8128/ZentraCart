const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {

    addToWishlist,
    getWishlist,
    removeFromWishlist

} = require("../controllers/wishlistController");


// Add Wishlist

router.post(

    "/add/:productId",

    authMiddleware,

    addToWishlist

);


// Get Wishlist

router.get(

    "/",

    authMiddleware,

    getWishlist

);


// Remove Wishlist

router.delete(

    "/remove/:productId",

    authMiddleware,

    removeFromWishlist

);

module.exports = router;