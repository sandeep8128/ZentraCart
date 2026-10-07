const Product = require("../models/Product");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

// ======================================================
// DELIVERY CONFIG
// ======================================================

const DELIVERY_RADIUS_KM = 30;

// ======================================================
// UPLOAD IMAGE TO CLOUDINARY
// ======================================================

const uploadToCloudinary = async (buffer) => {
  console.log("UPLOADING TO CLOUDINARY...");

  const base64 = `data:image/jpeg;base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(base64, {
    folder: "zentracart-products",
  });

  return result;
};

// ======================================================
// HAVERSINE DISTANCE
// ======================================================

const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const earthRadiusKm = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
};

// ======================================================
// VALIDATE COORDINATES
// ======================================================

const getValidCoordinates = (latitude, longitude) => {
  if (
    latitude === undefined ||
    latitude === null ||
    longitude === undefined ||
    longitude === null ||
    latitude === "" ||
    longitude === ""
  ) {
    return null;
  }

  const lat = Number(latitude);
  const lng = Number(longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  if (lat < -90 || lat > 90) {
    return null;
  }

  if (lng < -180 || lng > 180) {
    return null;
  }

  return {
    latitude: lat,
    longitude: lng,
  };
};

// ======================================================
// GET SELLER COORDINATES
// ======================================================

const getSellerCoordinates = (seller) => {
  if (!seller) {
    return null;
  }

  return getValidCoordinates(
    seller.location?.latitude,
    seller.location?.longitude,
  );
};

// ======================================================
// CHECK DELIVERY DISTANCE
//
// IMPORTANT:
// If customer OR seller location is missing,
// delivery remains allowed normally.
//
// Only when BOTH locations exist do we
// enforce the 30 KM rule.
// ======================================================

const checkDeliveryDistance = (customerLocation, seller) => {
  if (!customerLocation) {
    return {
      available: true,
      distance: null,
      locationChecked: false,
    };
  }

  const sellerLocation = getSellerCoordinates(seller);

  // Seller location is optional.
  // If seller has not configured location,
  // do NOT block the product.
  if (!sellerLocation) {
    return {
      available: true,
      distance: null,
      locationChecked: false,
    };
  }

  const distance = Number(
    calculateDistanceKm(
      customerLocation.latitude,
      customerLocation.longitude,
      sellerLocation.latitude,
      sellerLocation.longitude,
    ).toFixed(2),
  );

  return {
    available: distance <= DELIVERY_RADIUS_KM,
    distance,
    locationChecked: true,
  };
};

// ======================================================
// ADD PRODUCT
// ======================================================

exports.addProduct = async (req, res) => {
  try {
    const { title, description, features, price, category, stock } = req.body;

    // --------------------------------------------------
    // CHECK SELLER
    // --------------------------------------------------

    const seller = await User.findById(req.user.id).select("role location");

    if (!seller) {
      return res.status(404).json({
        message: "Seller not found",
      });
    }

    if (seller.role !== "seller") {
      return res.status(403).json({
        message: "Only sellers can add products",
      });
    }

    // --------------------------------------------------
    // UPLOAD IMAGES
    // --------------------------------------------------

    let images = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer);

        images.push({
          url: result.secure_url,
        });
      }
    }

    // --------------------------------------------------
    // CREATE PRODUCT
    // --------------------------------------------------

    const product = await Product.create({
      title,
      description,

      features: features
        ? features
            .split("\n")
            .map((f) => f.trim())
            .filter((f) => f !== "")
        : [],

      price: Number(price),
      category,
      images,
      stock: Number(stock) || 0,
      seller: req.user.id,

      approvalStatus: "approved",
    });

    return res.status(201).json({
      message: "Product Added Successfully",
      product,
    });
  } catch (error) {
    console.log("ADD PRODUCT ERROR =>", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ======================================================
// GET ALL PRODUCTS
//
// SEARCH
// FILTER
// SORT
// STATS
// OPTIONAL 30 KM DELIVERY FILTER
// ======================================================

exports.getProducts = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const category = req.query.category || "";

    const minPrice =
      req.query.minPrice !== undefined && req.query.minPrice !== ""
        ? Number(req.query.minPrice)
        : 0;

    const maxPrice =
      req.query.maxPrice !== undefined && req.query.maxPrice !== ""
        ? Number(req.query.maxPrice)
        : 999999999;

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = 24;

    // --------------------------------------------------
    // CUSTOMER LOCATION
    // --------------------------------------------------

    const customerLocation = getValidCoordinates(
      req.query.latitude,
      req.query.longitude,
    );

    // --------------------------------------------------
    // BASE QUERY
    //
    // IMPORTANT:
    // We DO NOT filter seller at MongoDB query level.
    //
    // Why?
    // Seller location is optional.
    //
    // If seller has no location:
    // => product should still appear.
    //
    // If both locations exist:
    // => distance is checked below.
    // --------------------------------------------------

    const query = {
      approvalStatus: "approved",

      title: {
        $regex: keyword,
        $options: "i",
      },

      price: {
        $gte: minPrice,
        $lte: maxPrice,
      },
    };

    if (category) {
      query.category = category;
    }

    // --------------------------------------------------
    // GET PRODUCTS
    //
    // Fetch enough products first so that after
    // 30 KM filtering pagination remains correct.
    // --------------------------------------------------

    let products = await Product.find(query)
      .populate("seller", "name email location")
      .sort(
        req.query.sort === "priceLow"
          ? { price: 1 }
          : req.query.sort === "priceHigh"
            ? { price: -1 }
            : req.query.sort === "rating"
              ? { rating: -1 }
              : { createdAt: -1 },
      );

    // --------------------------------------------------
    // OPTIONAL DELIVERY FILTER
    // --------------------------------------------------

    const processedProducts = [];

    for (const product of products) {
      const productObject = product.toObject();

      const deliveryCheck = checkDeliveryDistance(
        customerLocation,
        product.seller,
      );

      // ------------------------------------------------
      // CUSTOMER LOCATION + SELLER LOCATION
      // BOTH AVAILABLE
      // ------------------------------------------------

      if (deliveryCheck.locationChecked && !deliveryCheck.available) {
        // Product is outside 30 KM.
        // Do not show it in product listing.
        continue;
      }

      productObject.distance = deliveryCheck.distance;

      productObject.deliveryRadiusKm = DELIVERY_RADIUS_KM;

      productObject.available = true;

      productObject.deliveryLocationChecked = deliveryCheck.locationChecked;

      processedProducts.push(productObject);
    }

    // --------------------------------------------------
    // TOTAL AFTER DELIVERY FILTER
    // --------------------------------------------------

    const totalProducts = processedProducts.length;

    // --------------------------------------------------
    // UNIQUE SELLERS
    // --------------------------------------------------

    const uniqueSellerIds = new Set();

    processedProducts.forEach((product) => {
      const sellerId = product.seller?._id?.toString();

      if (sellerId) {
        uniqueSellerIds.add(sellerId);
      }
    });

    const totalSellers = uniqueSellerIds.size;

    // --------------------------------------------------
    // AVERAGE RATING
    // --------------------------------------------------

    const ratedProducts = processedProducts.filter(
      (product) =>
        Number.isFinite(Number(product.rating)) && Number(product.rating) > 0,
    );

    const averageRating =
      ratedProducts.length > 0
        ? Number(
            (
              ratedProducts.reduce(
                (sum, product) => sum + Number(product.rating),
                0,
              ) / ratedProducts.length
            ).toFixed(1),
          )
        : 0;

    // --------------------------------------------------
    // PAGINATION
    // --------------------------------------------------

    const skip = (page - 1) * limit;

    const paginatedProducts = processedProducts.slice(skip, skip + limit);

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return res.json({
      success: true,

      count: paginatedProducts.length,

      totalProducts,

      totalPages: Math.ceil(totalProducts / limit),

      currentPage: page,

      products: paginatedProducts,

      // ------------------------------------------------
      // LOCATION INFORMATION
      // ------------------------------------------------

      location: customerLocation
        ? {
            latitude: customerLocation.latitude,
            longitude: customerLocation.longitude,
            radiusKm: DELIVERY_RADIUS_KM,
          }
        : null,

      locationRequired: !customerLocation,

      deliveryRadiusKm: DELIVERY_RADIUS_KM,

      // ------------------------------------------------
      // HOMEPAGE STATS
      // ------------------------------------------------

      stats: {
        totalProducts,
        totalSellers,
        averageRating,
      },
    });
  } catch (error) {
    console.log("GET PRODUCTS ERROR =>", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// GET SINGLE PRODUCT
// ======================================================

exports.getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "seller",
      "name email location",
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // --------------------------------------------------
    // CUSTOMER LOCATION
    // --------------------------------------------------

    const customerLocation = getValidCoordinates(
      req.query.latitude,
      req.query.longitude,
    );

    // --------------------------------------------------
    // DELIVERY CHECK
    // --------------------------------------------------

    const deliveryCheck = checkDeliveryDistance(
      customerLocation,
      product.seller,
    );

    // --------------------------------------------------
    // BOTH LOCATIONS AVAILABLE + OUTSIDE 30 KM
    // --------------------------------------------------

    if (deliveryCheck.locationChecked && !deliveryCheck.available) {
      return res.status(403).json({
        success: false,

        available: false,

        distance: deliveryCheck.distance,

        deliveryRadiusKm: DELIVERY_RADIUS_KM,

        message: "This product is outside your 30 KM delivery range.",

        code: "OUTSIDE_DELIVERY_RADIUS",
      });
    }

    // --------------------------------------------------
    // RELATED PRODUCTS
    // --------------------------------------------------

    const relatedProductsRaw = await Product.find({
      category: product.category,

      _id: {
        $ne: product._id,
      },

      approvalStatus: "approved",
    })
      .populate("seller", "name email location")
      .sort({
        createdAt: -1,
      })
      .limit(20);

    // --------------------------------------------------
    // FILTER RELATED PRODUCTS
    // --------------------------------------------------

    const relatedProducts = [];

    for (const relatedProduct of relatedProductsRaw) {
      const relatedObject = relatedProduct.toObject();

      const relatedDeliveryCheck = checkDeliveryDistance(
        customerLocation,
        relatedProduct.seller,
      );

      // If both locations exist and related seller
      // is outside 30 KM, skip it.
      if (
        relatedDeliveryCheck.locationChecked &&
        !relatedDeliveryCheck.available
      ) {
        continue;
      }

      relatedObject.distance = relatedDeliveryCheck.distance;

      relatedObject.deliveryRadiusKm = DELIVERY_RADIUS_KM;

      relatedObject.available = true;

      relatedProducts.push(relatedObject);

      if (relatedProducts.length >= 4) {
        break;
      }
    }

    // --------------------------------------------------
    // PRODUCT RESPONSE OBJECT
    // --------------------------------------------------

    const productObject = product.toObject();

    productObject.distance = deliveryCheck.distance;

    productObject.deliveryRadiusKm = DELIVERY_RADIUS_KM;

    productObject.available = true;

    productObject.deliveryLocationChecked = deliveryCheck.locationChecked;

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return res.json({
      success: true,

      product: productObject,

      relatedProducts,

      deliveryRadiusKm: DELIVERY_RADIUS_KM,

      location: customerLocation
        ? {
            latitude: customerLocation.latitude,
            longitude: customerLocation.longitude,
          }
        : null,
    });
  } catch (error) {
    console.log("GET SINGLE PRODUCT ERROR =>", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// UPDATE PRODUCT
// ======================================================

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // --------------------------------------------------
    // OWNER CHECK
    // --------------------------------------------------

    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can update only your product",
      });
    }

    // --------------------------------------------------
    // UPDATE
    // --------------------------------------------------

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    return res.json({
      success: true,

      message: "Product Updated",

      product: updatedProduct,
    });
  } catch (error) {
    console.log("UPDATE PRODUCT ERROR =>", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// DELETE PRODUCT
// ======================================================

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // --------------------------------------------------
    // OWNER CHECK
    // --------------------------------------------------

    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can delete only your product",
      });
    }

    // --------------------------------------------------
    // DELETE
    // --------------------------------------------------

    await Product.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,

      message: "Product Deleted Successfully",
    });
  } catch (error) {
    console.log("DELETE PRODUCT ERROR =>", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// MY PRODUCTS
// SELLER
// ======================================================

exports.getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({
      seller: req.user.id,
    }).sort({
      createdAt: -1,
    });

    return res.json({
      success: true,

      count: products.length,

      products,
    });
  } catch (error) {
    console.log("GET MY PRODUCTS ERROR =>", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
