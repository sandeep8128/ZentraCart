const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    createOrder,
    getMyOrders,
    updateOrderStatus
} = require("../controllers/orderController");



// Create Order

router.post(
    "/create",
    authMiddleware,
    createOrder
);



// Get My Orders

router.get(
    "/my-orders",
    authMiddleware,
    getMyOrders
);

router.put(
"/status/:id",
authMiddleware,
updateOrderStatus
);


module.exports = router;