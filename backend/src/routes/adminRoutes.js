const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {

getPendingProducts,
approveProduct,
rejectProduct,
getDashboardStats

} = require("../controllers/adminController");



router.get(

"/pending-products",

authMiddleware,

roleMiddleware("admin"),

getPendingProducts

);



router.put(

"/approve/:id",

authMiddleware,

roleMiddleware("admin"),

approveProduct

);



router.put(

"/reject/:id",

authMiddleware,

roleMiddleware("admin"),

rejectProduct

);

router.get(

    "/dashboard",

    authMiddleware,

    roleMiddleware("admin"),

    getDashboardStats

);

module.exports = router;