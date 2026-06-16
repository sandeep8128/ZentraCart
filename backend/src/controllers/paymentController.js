const Payment = require("../models/Payment");
const Order = require("../models/Order");


// ==========================
// CREATE PAYMENT
// ==========================

exports.createPayment = async(req,res)=>{

try{

const {
orderId,
paymentMethod
} = req.body;


const order = await Order.findById(orderId);

if(!order){

return res.status(404).json({
message:"Order not found"
});

}


const payment = await Payment.create({

order:order._id,
user:req.user.id,
amount:order.totalAmount,
paymentMethod

});


res.status(201).json({

message:"Payment Created Successfully",

payment

});

}
catch(error){

res.status(500).json({
message:error.message
});

}

};




// ==========================
// MY PAYMENTS
// ==========================

exports.getMyPayments = async(req,res)=>{

try{

const payments = await Payment.find({

user:req.user.id

})
.populate("order");


res.json({

count:payments.length,

payments

});

}
catch(error){

res.status(500).json({
message:error.message
});

}

};