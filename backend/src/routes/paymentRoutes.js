const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    createPayment,
    getMyPayments
} = require("../controllers/paymentController");



// Create Payment

router.post(
    "/create",
    authMiddleware,
    createPayment
);



// Get My Payments

router.get(
    "/my-payments",
    authMiddleware,
    getMyPayments
);


module.exports = router;