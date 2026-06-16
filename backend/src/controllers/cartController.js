const Cart = require("../models/Cart");



// ADD TO CART


exports.addToCart = async(req,res)=>{

try{

const {
product,
quantity
}=req.body;


const existingItem = await Cart.findOne({

user:req.user.id,
product

});


if(existingItem){

existingItem.quantity += quantity || 1;

await existingItem.save();

return res.json({

message:"Cart Updated",

cart:existingItem

});

}


const cartItem = await Cart.create({

user:req.user.id,
product,
quantity

});


res.status(201).json({

message:"Added To Cart",

cart:cartItem

});


}
catch(error){

res.status(500).json({

message:error.message

});

}

};




// ===========================
// GET CART
// ===========================

exports.getCart = async(req,res)=>{

try{

const cart = await Cart.find({

user:req.user.id

})
.populate("product");


res.json({

count:cart.length,

cart

});


}
catch(error){

res.status(500).json({

message:error.message

});

}

};
// ===========================
// UPDATE CART QUANTITY
// ===========================

exports.updateCart = async(req,res)=>{

try{

const { quantity } = req.body;

const cartItem = await Cart.findById(req.params.id);

if(!cartItem){

return res.status(404).json({
message:"Cart item not found"
});

}

cartItem.quantity = quantity;

await cartItem.save();

res.json({

message:"Cart Updated Successfully",

cart:cartItem

});

}
catch(error){

res.status(500).json({
message:error.message
});

}

};
// ===========================
// REMOVE FROM CART
// ===========================

exports.removeFromCart = async(req,res)=>{

try{

const cartItem = await Cart.findById(req.params.id);

if(!cartItem){

return res.status(404).json({
message:"Cart item not found"
});

}

await Cart.findByIdAndDelete(req.params.id);

res.json({

message:"Item Removed From Cart"

});

}
catch(error){

res.status(500).json({
message:error.message
});

}

};