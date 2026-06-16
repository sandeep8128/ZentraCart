const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {

getSellerOrders,
getSellerAnalytics

} = require("../controllers/sellerController");



router.get(

"/orders",

authMiddleware,

roleMiddleware("seller"),

getSellerOrders

);



router.get(

"/analytics",

authMiddleware,

roleMiddleware("seller"),

getSellerAnalytics

);



module.exports = router;