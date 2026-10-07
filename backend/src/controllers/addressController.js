const Address = require("../models/Address");

// ==========================
// ADD ADDRESS
// ==========================

exports.addAddress = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      address,
      city,
      state,
      pincode,
      landmark,
      latitude,
      longitude,
    } = req.body;

    // Basic location validation
    if (
      latitude !== undefined &&
      latitude !== null &&
      longitude !== undefined &&
      longitude !== null
    ) {
      const lat = Number(latitude);
      const lng = Number(longitude);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return res.status(400).json({
          message: "Invalid latitude or longitude",
        });
      }

      if (lat < -90 || lat > 90) {
        return res.status(400).json({
          message: "Invalid latitude",
        });
      }

      if (lng < -180 || lng > 180) {
        return res.status(400).json({
          message: "Invalid longitude",
        });
      }
    }

    const addressData = {
      user: req.user.id,
      fullName,
      phone,
      address,
      city,
      state,
      pincode,
      landmark: landmark || "",
    };

    // Save location only when provided
    if (
      latitude !== undefined &&
      latitude !== null &&
      longitude !== undefined &&
      longitude !== null
    ) {
      addressData.location = {
        latitude: Number(latitude),
        longitude: Number(longitude),
      };
    }

    const newAddress = await Address.create(addressData);

    res.status(201).json({
      message: "Address Added",
      address: newAddress,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================
// GET MY ADDRESSES
// ==========================

exports.getMyAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({
      user: req.user.id,
    }).sort({
      createdAt: -1,
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

// ==========================
// DELETE ADDRESS
// ==========================

exports.deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!address) {
      return res.status(404).json({
        message: "Address not found",
      });
    }

    res.json({
      message: "Address Deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
