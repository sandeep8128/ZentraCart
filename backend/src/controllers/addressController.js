const Address = require("../models/Address");

// ADD ADDRESS

exports.addAddress = async (req, res) => {
  try {
    const address = await Address.create({
      user: req.user.id,
      fullName: req.body.fullName,
      phone: req.body.phone,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
      landmark: req.body.landmark,
    });

    res.status(201).json({
      message: "Address Added",
      address,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET MY ADDRESSES

exports.getMyAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({
      user: req.user.id,
    });

    res.json({
      count: addresses.length,
      addresses,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE ADDRESS

exports.deleteAddress = async (req, res) => {
  try {
    await Address.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message: "Address Deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};