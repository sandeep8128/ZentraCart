const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");


// ==========================
// ADD TO WISHLIST
// ==========================

exports.addToWishlist = async (req, res) => {

    try {

        const product = await Product.findById(req.params.productId);

        if (!product) {

            return res.status(404).json({
                message: "Product not found"
            });

        }

        const alreadyExists = await Wishlist.findOne({

            user: req.user.id,
            product: req.params.productId

        });

        if (alreadyExists) {

            return res.status(400).json({
                message: "Product already in wishlist"
            });

        }

        const wishlist = await Wishlist.create({

            user: req.user.id,
            product: req.params.productId

        });

        res.status(201).json({

            message: "Added To Wishlist",
            wishlist

        });

    }
    catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


// ==========================
// GET MY WISHLIST
// ==========================

exports.getWishlist = async (req, res) => {

    try {

        const wishlist = await Wishlist.find({

            user: req.user.id

        }).populate("product");

        res.json({

            count: wishlist.length,
            wishlist

        });

    }
    catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


// ==========================
// REMOVE FROM WISHLIST
// ==========================

exports.removeFromWishlist = async (req, res) => {

    try {

        const item = await Wishlist.findOne({

            user: req.user.id,
            product: req.params.productId

        });

        if (!item) {

            return res.status(404).json({
                message: "Wishlist item not found"
            });

        }

        await Wishlist.deleteOne({

            _id: item._id

        });

        res.json({

            message: "Removed From Wishlist"

        });

    }
    catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};