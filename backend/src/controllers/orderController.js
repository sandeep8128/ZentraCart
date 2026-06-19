const { getIO } = require("../socket/socket");
const Notification = require("../models/Notification");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Coupon = require("../models/Coupon");
const User = require("../models/User");
const Product = require("../models/Product");
const sendEmail = require("../utils/sendEmail");


// ==========================
// CREATE ORDER
// ==========================

exports.createOrder = async (req, res) => {
  try {
    const cartItems = await Cart.find({
      user: req.user.id,
    }).populate("product");

    if (cartItems.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    let totalAmount = 0;

    const products = [];

    cartItems.forEach((item) => {
      if (!item.product) return;

      totalAmount += item.product.price * item.quantity;

      products.push({
        product: item.product._id,

        quantity: item.quantity,
      });
    });

    // ==========================
    // STOCK CHECK
    // ==========================

    for (const item of cartItems) {
      if (!item.product) continue;

      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          message: `${item.product.title} is out of stock`,
        });
      }
    }

    if (products.length === 0) {
      return res.status(400).json({
        message: "No valid products found in cart",
      });
    }

    // ==========================
    // COUPON LOGIC
    // ==========================

    let discountAmount = 0;
    let finalAmount = totalAmount;
    let couponCode = "";

    const { coupon } = req.body;

    if (coupon) {
      const couponData = await Coupon.findOne({
        code: coupon.toUpperCase(),
        isActive: true,
      });

      if (couponData) {
        if (new Date() <= couponData.expiryDate) {
          discountAmount = (totalAmount * couponData.discount) / 100;

          finalAmount = totalAmount - discountAmount;

          couponCode = couponData.code;
        }
      }
    }

    // ==========================
    // CREATE ORDER
    // ==========================

    const order = await Order.create({
      user: req.user.id,

      products,

      totalAmount,

      couponCode,

      discountAmount,

      finalAmount,
    });

    // ==========================
    // REDUCE STOCK
    // ==========================

    for (const item of cartItems) {
      if (!item.product) continue;

      item.product.stock = item.product.stock - item.quantity;

      await item.product.save();
    }

    const user = await User.findById(req.user.id);

    await sendEmail(
      user.email,

      "Order Confirmed - ZentraCart",

      `Hello ${user.name},

Your order has been placed successfully.

Order ID: ${order._id}

Total Amount: ₹${order.finalAmount || order.totalAmount}

Status: ${order.orderStatus}

Thank you for shopping with ZentraCart.`,
    );

    // ==========================
    // SAVE NOTIFICATION
    // ==========================

    await Notification.create({
      user: req.user.id,

      title: "Order Placed",

      message: `Your order #${order._id} has been placed successfully`,
    });

    // ==========================
    // SOCKET NOTIFICATION
    // ==========================

    const io = getIO();

    io.emit("newOrder", {
      message: "New Order Placed",

      orderId: order._id,

      totalAmount: order.totalAmount,
    });

    // ==========================
    // CLEAR CART
    // ==========================

    await Cart.deleteMany({
      user: req.user.id,
    });

    // ==========================
    // RESPONSE
    // ==========================

    res.status(201).json({
      message: "Order Created Successfully",

      order,
    });
  } catch (error) {
    console.log("ORDER ERROR =>", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================
// GET MY ORDERS
// ==========================

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
    }).populate("products.product");

    res.json({
      count: orders.length,

      orders,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================
// UPDATE ORDER STATUS
// ==========================

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.orderStatus = orderStatus;

    await order.save();

    res.json({
      message: "Order Status Updated",

      order,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("products.product");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    if (
      order.orderStatus === "shipped" ||
      order.orderStatus === "delivered"
    ) {
      return res.status(400).json({
        message:
          "Order cannot be cancelled now",
      });
    }

    if (order.orderStatus === "cancelled") {
      return res.status(400).json({
        message:
          "Order already cancelled",
      });
    }

    // Restore Stock

    for (const item of order.products) {
      if (!item.product) continue;

      item.product.stock =
        item.product.stock + item.quantity;

      await item.product.save();
    }

    order.orderStatus = "cancelled";

    await order.save();

    res.json({
      message:
        "Order Cancelled Successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

