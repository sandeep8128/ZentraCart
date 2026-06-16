const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({

    order:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Order",
        required:true
    },

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    amount:{
        type:Number,
        required:true
    },

    paymentMethod:{
        type:String,
        enum:["COD","RAZORPAY"],
        default:"COD"
    },

    paymentStatus:{
        type:String,
        enum:["pending","paid","failed"],
        default:"pending"
    }

},{
    timestamps:true
});

module.exports = mongoose.model("Payment",paymentSchema);