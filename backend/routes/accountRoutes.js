const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const Product = require("../models/Product");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect);

const addressFields = [
  "label",
  "recipientName",
  "phone",
  "house",
  "street",
  "landmark",
  "city",
  "state",
  "pincode",
];

function validateAddress(input) {
  const address = {};
  for (const field of addressFields) {
    if (input[field] !== undefined) address[field] = String(input[field]).trim();
  }

  if (!['Home', 'Work', 'Other'].includes(address.label)) {
    address.label = "Home";
  }

  const required = ["recipientName", "phone", "house", "street", "city", "state", "pincode"];
  if (required.some((field) => !address[field])) {
    return { error: "Recipient, phone, address, city, state and PIN code are required" };
  }
  if (!/^\d{6}$/.test(address.pincode)) return { error: "PIN code must contain 6 digits" };
  if (!/^[+\d][\d\s().-]{6,19}$/.test(address.phone)) return { error: "Enter a valid phone number" };
  if (address.landmark === undefined) address.landmark = "";
  return { address };
}

function normalizeDefault(addresses, selectedId) {
  let defaultAssigned = false;
  for (const address of addresses) {
    const shouldDefault = selectedId
      ? String(address._id) === String(selectedId)
      : !defaultAssigned && address.isDefault;
    address.isDefault = shouldDefault && !defaultAssigned;
    if (address.isDefault) defaultAssigned = true;
  }
  if (!defaultAssigned && addresses.length) addresses[0].isDefault = true;
}

router.get("/addresses", async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("addresses");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.json({ success: true, addresses: user.addresses || [] });
  } catch (error) {
    console.error("Load addresses error:", error.message);
    return res.status(500).json({ success: false, message: "Could not load addresses" });
  }
});

router.post("/addresses", async (req, res) => {
  try {
    const result = validateAddress(req.body || {});
    if (result.error) return res.status(400).json({ success: false, message: result.error });

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    user.addresses.push({ ...result.address, isDefault: Boolean(req.body.isDefault) || user.addresses.length === 0 });
    normalizeDefault(user.addresses, user.addresses[user.addresses.length - 1]._id);
    await user.save();
    return res.status(201).json({ success: true, address: user.addresses[user.addresses.length - 1], addresses: user.addresses });
  } catch (error) {
    console.error("Create address error:", error.message);
    return res.status(500).json({ success: false, message: "Could not save address" });
  }
});

router.patch("/addresses/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid address" });
    const result = validateAddress(req.body || {});
    if (result.error) return res.status(400).json({ success: false, message: result.error });

    const user = await User.findById(req.user.userId);
    const address = user?.addresses.id(req.params.id);
    if (!address) return res.status(404).json({ success: false, message: "Address not found" });
    Object.assign(address, result.address);
    normalizeDefault(user.addresses, req.body.isDefault ? address._id : undefined);
    await user.save();
    return res.json({ success: true, address, addresses: user.addresses });
  } catch (error) {
    console.error("Update address error:", error.message);
    return res.status(500).json({ success: false, message: "Could not update address" });
  }
});

router.delete("/addresses/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid address" });
    const user = await User.findById(req.user.userId);
    const address = user?.addresses.id(req.params.id);
    if (!address) return res.status(404).json({ success: false, message: "Address not found" });
    const wasDefault = address.isDefault;
    address.deleteOne();
    if (wasDefault) normalizeDefault(user.addresses);
    await user.save();
    return res.json({ success: true, addresses: user.addresses });
  } catch (error) {
    console.error("Delete address error:", error.message);
    return res.status(500).json({ success: false, message: "Could not delete address" });
  }
});

router.patch("/addresses/:id/default", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid address" });
    const user = await User.findById(req.user.userId);
    if (!user?.addresses.id(req.params.id)) return res.status(404).json({ success: false, message: "Address not found" });
    normalizeDefault(user.addresses, req.params.id);
    await user.save();
    return res.json({ success: true, addresses: user.addresses });
  } catch (error) {
    console.error("Set default address error:", error.message);
    return res.status(500).json({ success: false, message: "Could not set default address" });
  }
});

router.get("/wishlist", async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate({
      path: "wishlist",
      match: { isAvailable: true },
      populate: { path: "category", select: "name slug" },
    });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.json({ success: true, products: user.wishlist || [] });
  } catch (error) {
    console.error("Load wishlist error:", error.message);
    return res.status(500).json({ success: false, message: "Could not load liked products" });
  }
});

router.post("/wishlist/:productId", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.productId)) return res.status(400).json({ success: false, message: "Invalid product" });
    const product = await Product.findOne({ _id: req.params.productId, isAvailable: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (!user.wishlist.some((id) => String(id) === String(product._id))) user.wishlist.push(product._id);
    await user.save();
    return res.status(201).json({ success: true, liked: true, productId: product._id });
  } catch (error) {
    console.error("Like product error:", error.message);
    return res.status(500).json({ success: false, message: "Could not like product" });
  }
});

router.delete("/wishlist/:productId", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.productId)) return res.status(400).json({ success: false, message: "Invalid product" });
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    user.wishlist = user.wishlist.filter((id) => String(id) !== String(req.params.productId));
    await user.save();
    return res.json({ success: true, liked: false, productId: req.params.productId });
  } catch (error) {
    console.error("Unlike product error:", error.message);
    return res.status(500).json({ success: false, message: "Could not unlike product" });
  }
});

module.exports = router;
