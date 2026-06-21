console.log("PRODUCT ROUTES FILE LOADED");

const express = require("express");
const upload = require("../middleware/upload");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  addProduct,
  getProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getMyProducts
} = require("../controllers/productController");


// ==========================
// TEST ROUTE
// ==========================

router.post("/test",(req,res)=>{

    console.log("TEST ROUTE HIT");

    res.json({
        message:"Test Success"
    });

});


// ==========================
// SELLER ADD PRODUCT
// ==========================

router.post(
"/add",
authMiddleware,
roleMiddleware("seller"),

(req,res,next)=>{
    console.log("ROUTE HIT");
    next();
},

upload.array("images", 5),

addProduct
);


// ==========================
// MY PRODUCTS
// ==========================

router.get(
"/my-products",
authMiddleware,
roleMiddleware("seller"),
getMyProducts
);


// ==========================
// GET ALL PRODUCTS
// ==========================

router.get(
"/",
getProducts
);


// ==========================
// GET SINGLE PRODUCT
// ==========================

router.get(
"/:id",
getSingleProduct
);


// ==========================
// UPDATE PRODUCT
// ==========================

router.put(
"/:id",
authMiddleware,
roleMiddleware("seller"),
updateProduct
);


// ==========================
// DELETE PRODUCT
// ==========================

router.delete(
"/:id",
authMiddleware,
roleMiddleware("seller"),
deleteProduct
);

module.exports = router;