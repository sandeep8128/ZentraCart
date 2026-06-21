const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Notification = require("../models/Notification");

// ==========================
// SELLER ORDERS
// ==========================

exports.getSellerOrders = async (req, res) => {
  try {
    const sellerProducts = await Product.find({
      seller: req.user.id,
    });

    const productIds = sellerProducts.map((product) => product._id);

    const orders = await Order.find({
      "products.product": {
        $in: productIds,
      },
    })
      .populate("user", "name email")
      .populate("products.product");

    res.json({
      totalOrders: orders.length,

      orders,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================
// SELLER ANALYTICS
// ==========================

exports.getSellerAnalytics = async (req, res) => {
  try {
    const sellerProducts = await Product.find({
      seller: req.user.id,
    });

    const productIds = sellerProducts.map((product) => product._id);

    const orders = await Order.find({
      "products.product": {
        $in: productIds,
      },
    });

    let totalRevenue = 0;

    orders.forEach((order) => {
      totalRevenue += order.finalAmount || order.totalAmount;
    });

    const approvedProducts = await Product.countDocuments({
      seller: req.user.id,
      approvalStatus: "approved",
    });

    const pendingProducts = await Product.countDocuments({
      seller: req.user.id,
      approvalStatus: "pending",
    });

    res.json({
      totalProducts: sellerProducts.length,

      approvedProducts,

      pendingProducts,

      totalOrders: orders.length,

      totalRevenue,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.orderStatus = status;

    await order.save();

    await Notification.create({
      user: order.user,
      title: "Order Status Updated",
      message: `Your order status is now ${status}`,
    });

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
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    await Order.findByIdAndDelete(req.params.id);

    res.json({
      message: "Order Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================
// SELLER STORE
// ==========================

exports.getSellerStore = async (req, res) => {
  try {
    const seller = await User.findById(
      req.params.sellerId
    ).select("-password");

    if (!seller) {
      return res.status(404).json({
        message: "Seller not found",
      });
    }

    const products = await Product.find({
      seller: req.params.sellerId,
      approvalStatus: "approved",
    });

    const totalRevenue = products.reduce(
      (acc, item) =>
        acc + item.price * item.stock,
      0
    );

    res.json({
      seller,
      totalProducts: products.length,
      totalRevenue,
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};