const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const jwt = require("jsonwebtoken");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const Product = require("../models/Product");
const Category = require("../models/Category");
const StoreSettings = require("../models/StoreSettings");
const Order = require("../models/Order");
const {
  cleanupOrphanedCloudinaryImages,
  cleanupUnusedCloudinaryImages,
  registerCloudinaryUpload,
} = require("../utils/cloudinaryImages");

const router = express.Router();

const cloudinaryConfigured = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

cloudinary.config(cloudinaryConfigured);

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Use a JPG, PNG, WEBP, AVIF or GIF image."));
    }

    cb(null, true);
  },
});


const defaultSettings = {
  heroTitle: "Beautiful essentials for every kitchen.",
  heroDescription:
    "Discover quality bartan, crockery and everyday kitchen essentials at Magotra Bartan Store — bringing practical products and timeless style to your home.",
  heroImage: "",
  heroImagePublicId: "",
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

router.post("/upload", (req, res) => {
  imageUpload.single("image")(req, res, async (uploadError) => {
    if (uploadError) {
      return res.status(400).json({
        success: false,
        message: uploadError.code === "LIMIT_FILE_SIZE"
          ? "Image must be 5 MB or smaller."
          : uploadError.message || "Invalid image upload.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please choose an image file.",
      });
    }

    if (
      !cloudinaryConfigured.cloud_name ||
      !cloudinaryConfigured.api_key ||
      !cloudinaryConfigured.api_secret
    ) {
      return res.status(503).json({
        success: false,
        message: "Cloudinary is not configured on the backend.",
      });
    }

    try {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "crockery", resource_type: "image" },
          (error, uploadedImage) => {
            if (error) return reject(error);
            resolve(uploadedImage);
          }
        );

        stream.end(req.file.buffer);
      });

      try {
        await registerCloudinaryUpload({
          url: result.secure_url,
          publicId: result.public_id,
        });
      } catch (registryError) {
        await cloudinary.uploader.destroy(result.public_id, {
          resource_type: "image",
        }).catch(() => {});
        throw registryError;
      }
      cleanupOrphanedCloudinaryImages().catch((error) => {
        console.error("Cloudinary orphan cleanup failed:", error.message);
      });

      return res.json({
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
      });
    } catch (error) {
      console.error("Cloudinary upload failed:", error.message);
      return res.status(502).json({
        success: false,
        message: "Could not upload image to Cloudinary.",
      });
    }
  });
});


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
      "heroImagePublicId",
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

    const previousSettings = await StoreSettings.findOne({ key: "main" });
    const previousHeroImage = {
      url: previousSettings?.heroImage || "",
      publicId: previousSettings?.heroImagePublicId || "",
    };

    const settings = await StoreSettings.findOneAndUpdate(
      { key: "main" },
      { $set: updates, $setOnInsert: { key: "main" } },
      { new: true, upsert: true, runValidators: true }
    );

    if (previousHeroImage.publicId !== settings.heroImagePublicId) {
      await cleanupUnusedCloudinaryImages([previousHeroImage]);
    }

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
