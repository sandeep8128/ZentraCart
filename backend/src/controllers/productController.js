const Product = require("../models/Product");

// ==========================
// ADD PRODUCT (SELLER)
// ==========================

exports.addProduct = async (req, res) => {
  try {
    const { title, description, price, category, stock } = req.body;

    const product = await Product.create({
      title,
      description,
      price,
      category,

      images: [
        {
          url: ""
        }
      ],

      stock,

      seller: req.user.id
    });

    res.status(201).json({
      message: "Product Added Successfully",
      product
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
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

    const query = {
      approvalStatus: "approved",

      title: {
        $regex: keyword,
        $options: "i"
      },

      price: {
        $gte: Number(minPrice),
        $lte: Number(maxPrice)
      }
    };

    if (category) {
      query.category = category;
    }

    const products = await Product.find(query)
      .populate("seller", "name email");

    res.json({
      count: products.length,
      products
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
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

    res.json({
      product,
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
