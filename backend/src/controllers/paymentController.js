const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const Payment = require("../models/payment");
const Order = require("../models/Order");

// ==========================
// CREATE PAYMENT
// ==========================

exports.createPayment = async (req, res) => {
  try {
    const { orderId, paymentMethod } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const payment = await Payment.create({
      order: order._id,
      user: req.user.id,
      amount: order.totalAmount,
      paymentMethod,
    });

    res.status(201).json({
      message: "Payment Created Successfully",

      payment,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================
// MY PAYMENTS
// ==========================

exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      user: req.user.id,
    }).populate("order");

    res.json({
      count: payments.length,

      payments,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
// ==========================
// CREATE RAZORPAY ORDER
// ==========================

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const options = {
      amount: Number(order.finalAmount || order.totalAmount) * 100,
      currency: "INR",
      receipt: order._id.toString(),
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      key: process.env.RAZORPAY_KEY_ID,
      razorpayOrder,
    });
  } catch (error) {
    console.log("RAZORPAY ERROR =>", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================
// VERIFY PAYMENT
// ==========================

exports.verifyPayment = async (req, res) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({
        message: "Payment Verification Failed",
      });
    }

    const order = await Order.findById(orderId);

    const payment = await Payment.create({
      order: order._id,
      user: req.user.id,
      amount: order.finalAmount || order.totalAmount,
      paymentMethod: "RAZORPAY",
      paymentStatus: "paid",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });
    order.paymentStatus = "paid";
    order.paymentMethod = "RAZORPAY";

    await order.save();

    res.json({
      message: "Payment Successful",
      payment,
    });
  } catch (error) {
    console.log("VERIFY ERROR =>", error);

    res.status(500).json({
      message: error.message,
    });
  }
};
