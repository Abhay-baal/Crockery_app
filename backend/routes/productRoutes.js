const express = require("express");

const {
  createProduct,
  getProducts,
  getProductById,
  getRecentlyAdded,
  updateProduct,
} = require("../controllers/productController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/", getProducts);
router.get("/recently-added", getRecentlyAdded);
router.get("/:id", getProductById);

router.post("/", protect, adminOnly, createProduct);
router.patch("/:id", protect, adminOnly, updateProduct);

module.exports = router;
