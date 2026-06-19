const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

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
    const { title, description, price, category, stock } = req.body;

    let imageUrl = "";

    if (req.file) {
      console.log("FILE RECEIVED =>");

      const result = await uploadToCloudinary(req.file.buffer);

      console.log("CLOUDINARY RESULT =>");
      console.dir(result, { depth: null });

      imageUrl = result.secure_url;
    }

    const product = await Product.create({
      title,
      description,
      price,
      category,

      images: [
        {
          url: imageUrl,
        },
      ],

      stock,

      seller: req.user.id,

      approvalStatus: "approved",
    });

    res.status(201).json({
      message: "Product Added Successfully",
      product,
    });
  } catch (error) {
    console.log("FULL ERROR =>");
    console.dir(error, { depth: null });

    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================
// GET ALL PRODUCTS + SEARCH + FILTER
// ==========================

exports.getProducts = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const category = req.query.category || "";

    const minPrice = req.query.minPrice || 0;
    const maxPrice = req.query.maxPrice || 999999999;

    const page = Number(req.query.page) || 1;
    const limit = 4;
    const skip = (page - 1) * limit;

    const query = {
      approvalStatus: "approved",

      title: {
        $regex: keyword,
        $options: "i",
      },

      price: {
        $gte: Number(minPrice),
        $lte: Number(maxPrice),
      },
    };
    if (category) {
      query.category = category;
    }

    const totalProducts = await Product.countDocuments(query);

    let productsQuery = Product.find(query).populate("seller", "name email");

    if (req.query.sort === "priceLow") {
      productsQuery = productsQuery.sort({ price: 1 });
    }

    if (req.query.sort === "priceHigh") {
      productsQuery = productsQuery.sort({ price: -1 });
    }

    if (req.query.sort === "rating") {
      productsQuery = productsQuery.sort({ rating: -1 });
    }

    const products = await productsQuery.skip(skip).limit(limit);

    res.json({
      count: products.length,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================
// GET SINGLE PRODUCT
// ==========================

exports.getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)

      .populate("seller", "name email");

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      approvalStatus: "approved",
    }).limit(4);

    res.json({
      product,
      relatedProducts,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================
// UPDATE PRODUCT
// ==========================

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Owner Check

    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can update only your product",
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,

      req.body,

      {
        new: true,
      },
    );

    res.json({
      message: "Product Updated",

      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================
// DELETE PRODUCT
// ==========================

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Seller Check

    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can delete only your product",
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      message: "Product Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================
// MY PRODUCTS (SELLER)
// ==========================

exports.getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({
      seller: req.user.id,
    });

    res.json({
      count: products.length,

      products,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
