const Coupon = require("../models/Coupon");


// ==========================
// CREATE COUPON (ADMIN)
// ==========================

exports.createCoupon = async (req, res) => {

    try {

        const {
            code,
            discount,
            expiryDate
        } = req.body;

        const coupon = await Coupon.create({

            code: code.toUpperCase(),
            discount,
            expiryDate

        });

        res.status(201).json({

            message: "Coupon Created Successfully",
            coupon

        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


// ==========================
// GET ALL COUPONS
// ==========================

exports.getCoupons = async (req, res) => {

    try {

        const coupons = await Coupon.find();

        res.json({

            count: coupons.length,
            coupons

        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


// ==========================
// APPLY COUPON
// ==========================

exports.applyCoupon = async (req, res) => {

    try {

        const {
            code,
            amount
        } = req.body;

        const coupon = await Coupon.findOne({

            code: code.toUpperCase(),
            isActive: true

        });

        if (!coupon) {

            return res.status(404).json({
                message: "Invalid Coupon"
            });

        }

        if (new Date() > coupon.expiryDate) {

            return res.status(400).json({
                message: "Coupon Expired"
            });

        }

        const discountAmount =
            (amount * coupon.discount) / 100;

        const finalAmount =
            amount - discountAmount;

        res.json({

            originalAmount: amount,
            discount: coupon.discount,
            discountAmount,
            finalAmount

        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

// ==========================
// DELETE COUPON
// ==========================

exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(
      req.params.id
    );

    if (!coupon) {
      return res.status(404).json({
        message: "Coupon not found",
      });
    }

    res.json({
      message: "Coupon Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};