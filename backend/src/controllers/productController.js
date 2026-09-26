const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

// ==========================
// UPLOAD IMAGE TO CLOUDINARY
// ==========================

const uploadToCloudinary = async (buffer) => {
  console.log("UPLOADING TO CLOUDINARY...");

  const base64 = `data:image/jpeg;base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(base64, {
    folder: "zentracart-products",
  });

  return result;
};

// ==========================
// ADD PRODUCT (SELLER)
// ==========================

exports.addProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      features,
      price,
      category,
      stock,
    } = req.body;

    let images = [];

    // Upload multiple images
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer);

        images.push({
          url: result.secure_url,
        });
      }
    }

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

    res.status(201).json({
      message: "Product Added Successfully",
      product,
    });
  } catch (error) {
    console.log("ADD PRODUCT ERROR =>", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================
// GET ALL PRODUCTS
// SEARCH + FILTER + SORT + STATS
// ==========================

exports.getProducts = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const category = req.query.category || "";

    const minPrice = Number(req.query.minPrice) || 0;
    const maxPrice =
      Number(req.query.maxPrice) || 999999999;

    const page = Number(req.query.page) || 1;

    const limit = 24;

    const skip = (page - 1) * limit;

    // ==========================================
    // PRODUCT QUERY
    // ==========================================

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

    // Category filter
    if (category) {
      query.category = category;
    }

    // ==========================================
    // TOTAL PRODUCTS
    // ==========================================

    const totalProducts =
      await Product.countDocuments(query);

    // ==========================================
    // TOTAL UNIQUE SELLERS
    // ==========================================

    const uniqueSellers =
      await Product.distinct("seller", {
        approvalStatus: "approved",
      });

    const totalSellers = uniqueSellers.length;

    // ==========================================
    // AVERAGE PRODUCT RATING
    // ==========================================

    const ratingStats =
      await Product.aggregate([
        {
          $match: {
            approvalStatus: "approved",

            rating: {
              $gt: 0,
            },
          },
        },

        {
          $group: {
            _id: null,

            averageRating: {
              $avg: "$rating",
            },
          },
        },
      ]);

    const averageRating =
      ratingStats.length > 0
        ? Number(
            ratingStats[0].averageRating.toFixed(1)
          )
        : 0;

    // ==========================================
    // GET PRODUCTS
    // ==========================================

    let productsQuery = Product.find(query).populate(
      "seller",
      "name email"
    );

    // ==========================================
    // SORTING
    // ==========================================

    if (req.query.sort === "priceLow") {
      productsQuery = productsQuery.sort({
        price: 1,
      });
    }

    if (req.query.sort === "priceHigh") {
      productsQuery = productsQuery.sort({
        price: -1,
      });
    }

    if (req.query.sort === "rating") {
      productsQuery = productsQuery.sort({
        rating: -1,
      });
    }

    // ==========================================
    // PAGINATION
    // ==========================================

    const products =
      await productsQuery
        .skip(skip)
        .limit(limit);

    // ==========================================
    // FINAL RESPONSE
    // ==========================================

    res.json({
      success: true,

      count: products.length,

      totalProducts,

      totalPages: Math.ceil(
        totalProducts / limit
      ),

      currentPage: page,

      products,

      // ========================================
      // HOMEPAGE REAL STATS
      // ========================================

      stats: {
        totalProducts,
        totalSellers,
        averageRating,
      },
    });
  } catch (error) {
    console.log("GET PRODUCTS ERROR =>", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// GET SINGLE PRODUCT
// ==========================

exports.getSingleProduct = async (req, res) => {
  try {
    const product =
      await Product.findById(req.params.id)
        .populate("seller", "name email");

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // ==========================================
    // RELATED PRODUCTS
    // ==========================================

    const relatedProducts =
      await Product.find({
        category: product.category,

        _id: {
          $ne: product._id,
        },

        approvalStatus: "approved",
      }).limit(4);

    res.json({
      success: true,

      product,

      relatedProducts,
    });
  } catch (error) {
    console.log(
      "GET SINGLE PRODUCT ERROR =>",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// UPDATE PRODUCT
// ==========================

exports.updateProduct = async (req, res) => {
  try {
    const product =
      await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // ==========================================
    // OWNER CHECK
    // ==========================================

    if (
      product.seller.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message:
          "You can update only your product",
      });
    }

    const updatedProduct =
      await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    res.json({
      success: true,

      message: "Product Updated",

      product: updatedProduct,
    });
  } catch (error) {
    console.log(
      "UPDATE PRODUCT ERROR =>",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// DELETE PRODUCT
// ==========================

exports.deleteProduct = async (req, res) => {
  try {
    const product =
      await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // ==========================================
    // OWNER CHECK
    // ==========================================

    if (
      product.seller.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message:
          "You can delete only your product",
      });
    }

    await Product.findByIdAndDelete(
      req.params.id
    );

    res.json({
      success: true,

      message:
        "Product Deleted Successfully",
    });
  } catch (error) {
    console.log(
      "DELETE PRODUCT ERROR =>",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// MY PRODUCTS (SELLER)
// ==========================

exports.getMyProducts = async (req, res) => {
  try {
    const products =
      await Product.find({
        seller: req.user.id,
      });

    res.json({
      success: true,

      count: products.length,

      products,
    });
  } catch (error) {
    console.log(
      "GET MY PRODUCTS ERROR =>",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};