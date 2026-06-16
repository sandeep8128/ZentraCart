const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");



// GET ALL PENDING PRODUCTS


exports.getPendingProducts = async(req,res)=>{

try{

const products = await Product.find({
approvalStatus:"pending"
})
.populate("seller","name email");

res.json({
count:products.length,
products
});

}
catch(error){

res.status(500).json({
message:error.message
});

}

};





// APPROVE PRODUCT


exports.approveProduct = async(req,res)=>{

try{

const product = await Product.findByIdAndUpdate(

req.params.id,

{
approvalStatus:"approved"
},

{
new:true
}

);

if(!product){

return res.status(404).json({
message:"Product not found"
});

}

res.json({

message:"Product Approved Successfully",

product

});

}
catch(error){

res.status(500).json({
message:error.message
});

}

};





// REJECT PRODUCT


exports.rejectProduct = async(req,res)=>{

try{

const product = await Product.findByIdAndUpdate(

req.params.id,

{
approvalStatus:"rejected"
},

{
new:true
}

);

if(!product){

return res.status(404).json({
message:"Product not found"
});

}

res.json({

message:"Product Rejected Successfully",

product

});

}
catch(error){

res.status(500).json({
message:error.message
});

}

};
// ==========================
// DASHBOARD STATS
// ==========================

exports.getDashboardStats = async (req, res) => {

    try {

        const totalUsers = await User.countDocuments();

        const totalProducts = await Product.countDocuments();

        const totalOrders = await Order.countDocuments();

        const pendingProducts = await Product.countDocuments({
            approvalStatus: "pending"
        });

        const orders = await Order.find();

        const totalRevenue = orders.reduce(
            (acc, order) => acc + order.totalAmount,
            0
        );

        res.json({

            totalUsers,
            totalProducts,
            totalOrders,
            pendingProducts,
            totalRevenue

        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};