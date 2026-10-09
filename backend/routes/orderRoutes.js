const express = require("express");
const Order = require("../models/Order");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const payload = req.body;

    if (!payload || typeof payload !== "object" ||
        Array.isArray(payload)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order",
      });
    }

    const total = Number(payload.total ?? payload.cartTotal ?? 0);

    if (!Number.isFinite(total) || total < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order total",
      });
    }

    const orderId =
      typeof payload.orderId === "string" &&
      payload.orderId.length <= 100
        ? payload.orderId
        : `MB-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const order = await Order.create({
      orderId,
      payload: { ...payload, orderId },
      status: "Pending",
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: order.orderId,
    });
  } catch (error) {
    console.error("Create order error:", error.message);

    res.status(500).json({
      success: false,
      message: "Could not save order",
    });
  }
});

module.exports = router;
