const { getIO } = require("../socket/socket");

const Notification = require("../models/Notification");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Coupon = require("../models/Coupon");
const User = require("../models/User");
const Product = require("../models/Product");
const sendEmail = require("../utils/sendEmail");
const PDFDocument = require("pdfkit");
const Address = require("../models/Address");

// =====================================================
// DELIVERY CONFIG
// =====================================================

const DELIVERY_RADIUS_KM = 30;

// =====================================================
// DISTANCE CALCULATOR - HAVERSINE FORMULA
// =====================================================

const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;

  const R = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// =====================================================
// CHECK VALID COORDINATES
// =====================================================

const hasValidCoordinates = (location) => {
  if (!location) return false;

  const latitude = Number(location.latitude);
  const longitude = Number(location.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return false;
  }

  if (latitude < -90 || latitude > 90) {
    return false;
  }

  if (longitude < -180 || longitude > 180) {
    return false;
  }

  return true;
};

// =====================================================
// CREATE ORDER
// =====================================================

exports.createOrder = async (req, res) => {
  const { coupon, addressId, buyNow = false, productId, quantity } = req.body;

  try {
    // =================================================
    // DEBUG LOG
    // =================================================

    console.log("==========================================");
    console.log("CREATE ORDER REQUEST");
    console.log("USER ID:", req.user?.id);
    console.log("BUY NOW VALUE:", buyNow);
    console.log("PRODUCT ID:", productId);
    console.log("QUANTITY:", quantity);
    console.log("ADDRESS ID:", addressId);
    console.log("==========================================");

    let checkoutItems = [];
    let cartItems = [];

    // =================================================
    // IMPORTANT BUY NOW DETECTION
    // =================================================
    //
    // We detect Buy Now in BOTH cases:
    //
    // 1. buyNow === true
    // 2. productId exists
    //
    // This makes backend robust even if frontend sends
    // buyNow as string/boolean or accidentally omits it.
    //
    // =================================================

    const isBuyNow = buyNow === true || buyNow === "true" || Boolean(productId);

    console.log("FINAL CHECKOUT MODE:", isBuyNow ? "BUY NOW" : "CART");

    // =================================================
    // PREPARE ORDER ITEMS
    // =================================================

    if (isBuyNow) {
      // =================================================
      // BUY NOW MODE
      // =================================================

      console.log("BUY NOW MODE STARTED");

      if (!productId) {
        return res.status(400).json({
          message: "Product is required for Buy Now",
          code: "PRODUCT_REQUIRED",
        });
      }

      // =================================================
      // VALIDATE QUANTITY
      // =================================================

      const buyNowQuantity = Number(quantity);

      if (!Number.isInteger(buyNowQuantity) || buyNowQuantity < 1) {
        return res.status(400).json({
          message: "Invalid product quantity",
          code: "INVALID_QUANTITY",
        });
      }

      console.log("BUY NOW PRODUCT ID:", productId);

      console.log("BUY NOW QUANTITY:", buyNowQuantity);

      // =================================================
      // GET PRODUCT DIRECTLY
      // =================================================
      //
      // VERY IMPORTANT:
      // Do NOT read Cart in Buy Now mode.
      //
      // =================================================

      const buyNowProduct = await Product.findById(productId).populate(
        "seller",
        "_id name email location",
      );

      if (!buyNowProduct) {
        return res.status(404).json({
          message: "Product not found",
          code: "PRODUCT_NOT_FOUND",
        });
      }

      console.log("BUY NOW PRODUCT FOUND:", buyNowProduct._id.toString());

      console.log("BUY NOW PRODUCT TITLE:", buyNowProduct.title);

      console.log("BUY NOW PRODUCT PRICE:", buyNowProduct.price);

      // =================================================
      // CREATE CHECKOUT ITEM
      // =================================================

      checkoutItems = [
        {
          product: buyNowProduct,
          quantity: buyNowQuantity,
        },
      ];
    } else {
      // =================================================
      // NORMAL CART CHECKOUT MODE
      // =================================================

      console.log("CART CHECKOUT MODE STARTED");

      cartItems = await Cart.find({
        user: req.user.id,
      }).populate("product");

      console.log("CART ITEMS COUNT:", cartItems.length);

      if (cartItems.length === 0) {
        return res.status(400).json({
          message: "Cart is empty",
          code: "CART_EMPTY",
        });
      }

      checkoutItems = cartItems
        .filter((item) => item.product)
        .map((item) => ({
          product: item.product,
          quantity: Number(item.quantity || 0),
        }))
        .filter((item) => item.quantity > 0);
    }

    // =================================================
    // VALIDATE CHECKOUT ITEMS
    // =================================================

    if (checkoutItems.length === 0) {
      return res.status(400).json({
        message: "No valid products found for order",
        code: "NO_VALID_PRODUCTS",
      });
    }

    console.log("CHECKOUT ITEMS COUNT:", checkoutItems.length);

    // =================================================
    // CALCULATE TOTAL
    // =================================================

    let totalAmount = 0;

    const products = [];

    checkoutItems.forEach((item) => {
      const itemPrice = Number(item.product?.price || 0);

      const itemQuantity = Number(item.quantity || 0);

      totalAmount += itemPrice * itemQuantity;

      products.push({
        product: item.product._id,
        quantity: itemQuantity,
      });
    });

    // =================================================
    // VALIDATE TOTAL
    // =================================================

    if (!Number.isFinite(totalAmount) || totalAmount < 0) {
      return res.status(400).json({
        message: "Invalid order amount",
        code: "INVALID_ORDER_AMOUNT",
      });
    }

    console.log("TOTAL PRODUCT AMOUNT:", totalAmount);

    // =================================================
    // STOCK CHECK
    // =================================================

    for (const item of checkoutItems) {
      const availableStock = Number(item.product.stock || 0);

      const requestedQuantity = Number(item.quantity || 0);

      if (availableStock < requestedQuantity) {
        return res.status(400).json({
          message: `${item.product.title} is out of stock`,
          code: "OUT_OF_STOCK",
        });
      }
    }

    // =================================================
    // GET DELIVERY ADDRESS
    // =================================================

    if (!addressId) {
      return res.status(400).json({
        message: "Please select delivery address",
      });
    }

    // =================================================
    // ADDRESS MUST BELONG TO USER
    // =================================================

    const selectedAddress = await Address.findOne({
      _id: addressId,
      user: req.user.id,
    });

    if (!selectedAddress) {
      return res.status(400).json({
        message: "Please select a valid delivery address",
      });
    }

    console.log("DELIVERY ADDRESS FOUND:", selectedAddress._id.toString());

    // =================================================
    // OPTIONAL 30 KM DELIVERY VALIDATION
    // =================================================

    const customerHasLocation = hasValidCoordinates(selectedAddress.location);

    console.log("CUSTOMER LOCATION AVAILABLE:", customerHasLocation);

    // =================================================
    // GET SELLER IDS
    // =================================================

    const sellerIds = [
      ...new Set(
        checkoutItems
          .filter((item) => item.product?.seller)
          .map((item) => {
            const seller = item.product.seller;

            return seller?._id ? seller._id.toString() : seller.toString();
          }),
      ),
    ];

    if (sellerIds.length === 0) {
      return res.status(400).json({
        message: "No valid seller found for products.",
        code: "SELLER_NOT_FOUND",
      });
    }

    // =================================================
    // GET SELLERS
    // =================================================

    const sellers = await User.find({
      _id: {
        $in: sellerIds,
      },
      role: "seller",
    }).select("_id name email location");

    const sellerMap = new Map(
      sellers.map((seller) => [seller._id.toString(), seller]),
    );

    // =================================================
    // CHECK EVERY PRODUCT FOR 30 KM DELIVERY
    // =================================================

    for (const item of checkoutItems) {
      const product = item.product;

      const sellerId = product.seller?._id
        ? product.seller._id.toString()
        : product.seller
          ? product.seller.toString()
          : null;

      // =================================================
      // SELLER ID CHECK
      // =================================================

      if (!sellerId) {
        return res.status(400).json({
          message: `${product.title} has no seller assigned.`,
          code: "SELLER_NOT_FOUND",
        });
      }

      const seller = sellerMap.get(sellerId);

      if (!seller) {
        return res.status(400).json({
          message: `Seller not found for ${product.title}.`,
          code: "SELLER_NOT_FOUND",
        });
      }

      // =================================================
      // CUSTOMER LOCATION NOT AVAILABLE
      // =================================================

      if (!customerHasLocation) {
        console.log(
          `NORMAL ORDER MODE | Product: ${product.title} | Customer location unavailable`,
        );

        continue;
      }

      // =================================================
      // SELLER LOCATION CHECK
      // =================================================

      const sellerHasLocation = hasValidCoordinates(seller.location);

      if (!sellerHasLocation) {
        console.log(
          `NORMAL ORDER ALLOWED | Product: ${product.title} | Seller location unavailable`,
        );

        continue;
      }

      // =================================================
      // CUSTOMER COORDINATES
      // =================================================

      const customerLat = Number(selectedAddress.location.latitude);

      const customerLng = Number(selectedAddress.location.longitude);

      // =================================================
      // SELLER COORDINATES
      // =================================================

      const sellerLat = Number(seller.location.latitude);

      const sellerLng = Number(seller.location.longitude);

      // =================================================
      // CALCULATE DISTANCE
      // =================================================

      const distance = calculateDistanceKm(
        customerLat,
        customerLng,
        sellerLat,
        sellerLng,
      );

      console.log(
        `DELIVERY CHECK | Product: ${product.title} | Seller: ${seller.name} | Distance: ${distance.toFixed(
          2,
        )} KM`,
      );

      // =================================================
      // 30 KM LIMIT
      // =================================================

      if (distance > DELIVERY_RADIUS_KM) {
        return res.status(400).json({
          message: `${product.title} is outside your 30 KM delivery range.`,
          code: "OUTSIDE_DELIVERY_RADIUS",
          distance: Number(distance.toFixed(2)),
          maxDistance: DELIVERY_RADIUS_KM,
          seller: {
            id: seller._id,
            name: seller.name,
          },
        });
      }
    }

    // =================================================
    // COUPON LOGIC
    // =================================================

    let discountAmount = 0;

    let finalAmount = totalAmount;

    let couponCode = "";

    if (coupon && typeof coupon === "string" && coupon.trim()) {
      const couponData = await Coupon.findOne({
        code: coupon.trim().toUpperCase(),
        isActive: true,
      });

      if (couponData && new Date() <= couponData.expiryDate) {
        discountAmount = (totalAmount * Number(couponData.discount || 0)) / 100;

        // Never allow negative final amount
        discountAmount = Math.min(discountAmount, totalAmount);

        finalAmount = totalAmount - discountAmount;

        couponCode = couponData.code;
      }
    }

    // =================================================
    // ROUND MONEY VALUES
    // =================================================

    totalAmount = Number(totalAmount.toFixed(2));

    discountAmount = Number(discountAmount.toFixed(2));

    finalAmount = Number(finalAmount.toFixed(2));

    console.log("FINAL ORDER AMOUNT:", finalAmount);

    // =================================================
    // CREATE ORDER
    // =================================================

    const order = await Order.create({
      user: req.user.id,

      products,

      totalAmount,

      couponCode,

      discountAmount,

      finalAmount,

      shippingAddress: {
        fullName: selectedAddress.fullName,

        phone: selectedAddress.phone,

        address: selectedAddress.address,

        city: selectedAddress.city,

        state: selectedAddress.state,

        pincode: selectedAddress.pincode,

        landmark: selectedAddress.landmark,
      },
    });

    console.log("ORDER CREATED:", order._id.toString());

    // =================================================
    // REDUCE STOCK
    // =================================================

    for (const item of checkoutItems) {
      item.product.stock =
        Number(item.product.stock || 0) - Number(item.quantity || 0);

      await item.product.save();
    }

    // =================================================
    // CLEAR CART
    //
    // IMPORTANT:
    //
    // Buy Now:
    // DO NOT CLEAR CART
    //
    // Normal Cart Checkout:
    // CLEAR CART
    //
    // =================================================

    if (!isBuyNow) {
      console.log("CART CHECKOUT -> CLEARING CART");

      await Cart.deleteMany({
        user: req.user.id,
      });
    } else {
      console.log("BUY NOW -> CART WILL NOT BE CLEARED");
    }

    // =================================================
    // SEND SUCCESS RESPONSE IMMEDIATELY
    // =================================================

    res.status(201).json({
      message: "Order Created Successfully",

      order,

      checkoutMode: isBuyNow ? "buyNow" : "cart",

      totalAmount,

      discountAmount,

      finalAmount,
    });

    // =================================================
    // BACKGROUND TASKS
    // =================================================

    setImmediate(async () => {
      try {
        // =================================================
        // GET USER
        // =================================================

        const user = await User.findById(req.user.id);

        // =================================================
        // SEND EMAIL
        // =================================================

        if (user) {
          try {
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
          } catch (emailError) {
            console.error("ORDER EMAIL ERROR:", emailError.message);
          }
        }

        // =================================================
        // SAVE NOTIFICATION
        // =================================================

        try {
          await Notification.create({
            user: req.user.id,

            title: "Order Placed",

            message: `Your order #${order._id} has been placed successfully`,
          });
        } catch (notificationError) {
          console.error("NOTIFICATION ERROR:", notificationError.message);
        }

        // =================================================
        // SOCKET NOTIFICATION
        // =================================================

        try {
          const io = getIO();

          if (io) {
            io.emit("newOrder", {
              message: "New Order Placed",

              orderId: order._id,

              totalAmount: order.totalAmount,
            });
          }
        } catch (socketError) {
          console.error("SOCKET NOTIFICATION ERROR:", socketError.message);
        }
      } catch (backgroundError) {
        console.error("BACKGROUND ORDER TASK ERROR:", backgroundError.message);
      }
    });
  } catch (error) {
    console.log("ORDER ERROR =>", error);

    if (!res.headersSent) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }
};

// =====================================================
// GET MY ORDERS
// =====================================================

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

// =====================================================
// GET SELLER ORDERS
// =====================================================

exports.getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("products.product");

    const sellerOrders = [];

    orders.forEach((order) => {
      const sellerProducts = order.products.filter(
        (item) =>
          item.product &&
          item.product.seller &&
          item.product.seller.toString() === req.user.id,
      );

      if (sellerProducts.length > 0) {
        sellerOrders.push({
          ...order.toObject(),

          products: sellerProducts,
        });
      }
    });

    res.json({
      count: sellerOrders.length,

      orders: sellerOrders,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// UPDATE ORDER STATUS
// =====================================================

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

// =====================================================
// CANCEL ORDER
// =====================================================

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "products.product",
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // =================================================
    // ONLY ORDER OWNER CAN CANCEL
    // =================================================

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    // =================================================
    // SHIPPED / DELIVERED CANNOT BE CANCELLED
    // =================================================

    if (order.orderStatus === "shipped" || order.orderStatus === "delivered") {
      return res.status(400).json({
        message: "Order cannot be cancelled now",
      });
    }

    // =================================================
    // ALREADY CANCELLED
    // =================================================

    if (order.orderStatus === "cancelled") {
      return res.status(400).json({
        message: "Order already cancelled",
      });
    }

    // =================================================
    // RESTORE STOCK
    // =================================================

    for (const item of order.products) {
      if (!item.product) {
        continue;
      }

      item.product.stock =
        Number(item.product.stock || 0) + Number(item.quantity || 0);

      await item.product.save();
    }

    // =================================================
    // UPDATE ORDER
    // =================================================

    order.orderStatus = "cancelled";

    await order.save();

    res.json({
      message: "Order Cancelled Successfully",

      order,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// DELETE CANCELLED ORDER
// =====================================================

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // =================================================
    // ONLY ORDER OWNER CAN DELETE
    // =================================================

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    // =================================================
    // ONLY CANCELLED ORDERS CAN BE DELETED
    // =================================================

    if (order.orderStatus !== "cancelled") {
      return res.status(400).json({
        message: "Only cancelled orders can be deleted",
      });
    }

    await Order.findByIdAndDelete(order._id);

    res.json({
      message: "Order Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// DOWNLOAD INVOICE
// =====================================================

exports.downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("products.product", "title price");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order._id}.pdf`,
    );

    doc.pipe(res);

    // =================================================
    // INVOICE HEADER
    // =================================================

    doc.fontSize(22).text("ZentraCart Invoice", {
      align: "center",
    });

    doc.moveDown();

    doc.fontSize(12);

    doc.text(`Order ID: ${order._id}`);

    doc.text(`Customer: ${order.user ? order.user.name : "N/A"}`);

    doc.text(`Email: ${order.user ? order.user.email : "N/A"}`);

    doc.text(`Status: ${order.orderStatus}`);

    doc.text(
      `Date: ${
        order.createdAt
          ? new Date(order.createdAt).toLocaleDateString()
          : new Date().toLocaleDateString()
      }`,
    );

    doc.moveDown();

    // =================================================
    // PRODUCTS
    // =================================================

    doc.text("Products:");

    order.products.forEach((item) => {
      if (!item.product) {
        return;
      }

      doc.text(`${item.product.title} x ${item.quantity}`);
    });

    doc.moveDown();

    // =================================================
    // AMOUNT
    // =================================================

    doc.text(`Total Amount: ₹${order.totalAmount}`);

    doc.text(`Discount: ₹${order.discountAmount || 0}`);

    doc.text(`Final Amount: ₹${order.finalAmount || order.totalAmount}`);

    doc.end();
  } catch (error) {
    console.log("INVOICE ERROR =>", error);

    if (!res.headersSent) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
};
