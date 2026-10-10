const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Every customer order request requires a valid JWT.
router.use(protect);

// GET /api/orders — current customer's complete order history.
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find({
      userId: req.user.userId,
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Load customer orders error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not load your orders",
    });
  }
});

// POST /api/orders — place an authenticated customer's order.
router.post("/", async (req, res) => {
  try {
    const payload = req.body;

    if (
      !payload ||
      typeof payload !== "object" ||
      Array.isArray(payload)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order",
      });
    }

    const items = payload.items;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your order must contain at least one product",
      });
    }

    const total = Number(payload.total ?? payload.cartTotal);

    if (!Number.isFinite(total) || total <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order total",
      });
    }

    const orderId =
      typeof payload.orderId === "string" &&
      payload.orderId.trim().length > 0 &&
      payload.orderId.length <= 100
        ? payload.orderId.trim()
        : typeof payload.id === "string" &&
            payload.id.trim().length > 0 &&
            payload.id.length <= 100
          ? payload.id.trim()
          : `CB-${Date.now()}-${Math.random()
              .toString(36)
              .slice(2, 7)}`;

    const existing = await Order.findOne({ orderId });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "This order ID already exists. Please try again.",
      });
    }

    const order = await Order.create({
      orderId,
      userId: req.user.userId,
      payload: {
        ...payload,
        orderId,
        total,
        status: "Pending",
      },
      status: "Pending",
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: order.orderId,
      order,
    });
  } catch (error) {
    console.error("Create order error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not save order",
    });
  }
});

// GET /api/orders/:id — only the order's owner can view it.
router.get("/:id", async (req, res) => {
  try {
    const isMongoId = mongoose.isValidObjectId(req.params.id);

    const order = await Order.findOne({
      userId: req.user.userId,
      ...(isMongoId
        ? { _id: req.params.id }
        : { orderId: req.params.id }),
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Load order details error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not load order details",
    });
  }
});

module.exports = router;
