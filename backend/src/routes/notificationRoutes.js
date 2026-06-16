const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {

getNotifications,
markAsRead

} = require("../controllers/notificationController");



// GET NOTIFICATIONS

router.get(

"/",

authMiddleware,

getNotifications

);



// MARK AS READ

router.put(

"/:id",

authMiddleware,

markAsRead

);


module.exports = router;