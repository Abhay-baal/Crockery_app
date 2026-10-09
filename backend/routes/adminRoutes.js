const express = require("express");
const jwt = require("jsonwebtoken");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const Product = require("../models/Product");
const Category = require("../models/Category");
const StoreSettings = require("../models/StoreSettings");
const Order = require("../models/Order");

const router = express.Router();

const defaultSettings = {
  heroTitle: "Beautiful essentials for every kitchen.",
  heroDescription:
    "Discover quality bartan, crockery and everyday kitchen essentials at Magotra Bartan Store — bringing practical products and timeless style to your home.",
  heroImage: "",
  primaryButton: "Shop products",
  secondaryButton: "Explore collections",
};

// Public storefront setting. No credentials or private data returned.
router.get("/hero", async (req, res) => {
  try {
    const settings = await StoreSettings.findOne({ key: "main" });
    res.json({
      success: true,
      settings: { ...defaultSettings, ...(settings?.toObject() || {}) },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not load storefront settings",
    });
  }
});

// Two-step admin login. All credential checks happen on the server.
router.post("/login", async (req, res) => {
  try {
    const { accessKey, username, password } = req.body;

    const expectedKey = process.env.ADMIN_ACCESS_KEY;
    const expectedUsername = process.env.ADMIN_USERNAME;
    const expectedPassword = process.env.ADMIN_PASSWORD;

    if (!expectedKey || !expectedUsername || !expectedPassword) {
      return res.status(503).json({
        success: false,
        message:
          "Admin credentials are not configured on the backend.",
      });
    }

    if (
      typeof accessKey !== "string" ||
      typeof username !== "string" ||
      typeof password !== "string" ||
      accessKey !== expectedKey ||
      username !== expectedUsername ||
      password !== expectedPassword
    ) {
      return res.status(401).json({
        success: false,
        message: "Incorrect access key, username or password",
      });
    }

    const token = jwt.sign(
      { userId: "store-admin", role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      success: true,
      token,
      message: "Admin login successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Admin login failed",
    });
  }
});

router.use(protect, adminOnly);

router.get("/dashboard", async (req, res) => {
  try {
    const [
      products,
      activeProducts,
      categories,
      pendingOrders,
      totalOrders,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ isAvailable: true }),
      Category.countDocuments({ isActive: true }),
      Order.countDocuments({ status: "Pending" }),
      Order.countDocuments(),
    ]);

    res.json({
      success: true,
      stats: {
        products,
        activeProducts,
        categories,
        pendingOrders,
        totalOrders,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not load dashboard",
    });
  }
});

router.get("/products", async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name slug")
      .sort({ createdAt: -1 });

    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not load products",
    });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not load categories",
    });
  }
});

router.get("/settings", async (req, res) => {
  try {
    const settings = await StoreSettings.findOne({ key: "main" });
    res.json({
      success: true,
      settings: { ...defaultSettings, ...(settings?.toObject() || {}) },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not load settings",
    });
  }
});

router.put("/settings", async (req, res) => {
  try {
    const allowed = [
      "heroTitle",
      "heroDescription",
      "heroImage",
      "primaryButton",
      "secondaryButton",
    ];

    const updates = {};

    for (const field of allowed) {
      if (req.body[field] !== undefined) {
        if (typeof req.body[field] !== "string") {
          return res.status(400).json({
            success: false,
            message: `Invalid value for ${field}`,
          });
        }

        if (req.body[field].length > 2_000_000) {
          return res.status(413).json({
            success: false,
            message: "Image is too large",
          });
        }

        updates[field] = req.body[field];
      }
    }

    const settings = await StoreSettings.findOneAndUpdate(
      { key: "main" },
      { $set: updates, $setOnInsert: { key: "main" } },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not save storefront settings",
    });
  }
});

router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(500);

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not load orders",
    });
  }
});

router.patch("/orders/:id", async (req, res) => {
  try {
    const allowedStatuses = [
      "Pending",
      "Accepted",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    const { status, adminNote } = req.body;

    if (status !== undefined && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const updates = {};

    if (status !== undefined) updates.status = status;
    if (adminNote !== undefined) {
      updates.adminNote = String(adminNote).slice(0, 1000);
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not update order",
    });
  }
});

module.exports = router;
