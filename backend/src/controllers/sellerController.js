const Order = require("../models/Order");
const Product = require("../models/Product");


// ==========================
// SELLER ORDERS
// ==========================

exports.getSellerOrders = async(req,res)=>{

try{

const sellerProducts = await Product.find({
seller:req.user.id
});

const productIds = sellerProducts.map(
product => product._id
);


const orders = await Order.find({
"products.product":{
$in:productIds
}
})
.populate("user","name email")
.populate("products.product");


res.json({

totalOrders:orders.length,

orders

});

}
catch(error){

res.status(500).json({

message:error.message

});

}

};




// ==========================
// SELLER ANALYTICS
// ==========================

exports.getSellerAnalytics = async(req,res)=>{

try{

const sellerProducts = await Product.find({
seller:req.user.id
});

const productIds = sellerProducts.map(
product => product._id
);

const orders = await Order.find({
"products.product":{
$in:productIds
}
});

let totalRevenue = 0;

orders.forEach(order=>{
totalRevenue += order.finalAmount || order.totalAmount;
});

const approvedProducts =
await Product.countDocuments({
seller:req.user.id,
approvalStatus:"approved"
});

const pendingProducts =
await Product.countDocuments({
seller:req.user.id,
approvalStatus:"pending"
});

res.json({

totalProducts:sellerProducts.length,

approvedProducts,

pendingProducts,

totalOrders:orders.length,

totalRevenue

});

}
catch(error){

res.status(500).json({
message:error.message
});

}

};