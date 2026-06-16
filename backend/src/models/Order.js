const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    products:[
        {
            product:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Product"
            },

            quantity:{
                type:Number,
                required:true
            }
        }
    ],

    totalAmount:{
        type:Number,
        required:true
    },
    couponCode:{
    type:String,
    default:""
},

discountAmount:{
    type:Number,
    default:0
},

finalAmount:{
    type:Number,
    default:0
},

    orderStatus:{
        type:String,
        enum:[
            "pending",
            "confirmed",
            "shipped",
            "delivered",
            "cancelled"
        ],
        default:"pending"
    },

    paymentStatus:{
        type:String,
        enum:[
            "pending",
            "paid",
            "failed"
        ],
        default:"pending"
    }

},{
    timestamps:true
});

module.exports = mongoose.model("Order",orderSchema);