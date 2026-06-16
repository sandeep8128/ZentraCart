const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    addToCart,
    getCart,
    updateCart,
    removeFromCart
} = require("../controllers/cartController");


// Add To Cart

router.post(
    "/add",
    authMiddleware,
    addToCart
);


// Get User Cart

router.get(
    "/",
    authMiddleware,
    getCart
);

router.put(
"/update/:id",
authMiddleware,
updateCart
);

router.delete(
"/remove/:id",
authMiddleware,
removeFromCart
);


module.exports = router;