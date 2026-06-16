const Review = require("../models/Review");
const Product = require("../models/Product");


// ==========================
// ADD REVIEW
// ==========================

exports.addReview = async (req, res) => {

    try {

        const { rating, comment } = req.body;

        const product = await Product.findById(req.params.productId);

        if (!product) {

            return res.status(404).json({
                message: "Product not found"
            });

        }

        const review = await Review.create({

            user: req.user.id,
            product: req.params.productId,
            rating,
            comment

        });

        // Update Product Rating

        const reviews = await Review.find({
            product: req.params.productId
        });

        const avgRating =
            reviews.reduce((acc, item) => acc + item.rating, 0)
            / reviews.length;

        product.rating = avgRating;

        await product.save();

        res.status(201).json({

            message: "Review Added Successfully",
            review

        });

    }
    catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


// ==========================
// GET PRODUCT REVIEWS
// ==========================

exports.getProductReviews = async (req, res) => {

    try {

        const reviews = await Review.find({

            product: req.params.productId

        }).populate("user", "name");

        res.json({

            count: reviews.length,
            reviews

        });

    }
    catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


// ==========================
// DELETE REVIEW
// ==========================

exports.deleteReview = async (req, res) => {

    try {

        const review = await Review.findById(req.params.id);

        if (!review) {

            return res.status(404).json({
                message: "Review not found"
            });

        }

        await Review.findByIdAndDelete(req.params.id);

        res.json({

            message: "Review Deleted Successfully"

        });

    }
    catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};