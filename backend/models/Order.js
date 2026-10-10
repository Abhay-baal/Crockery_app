const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },

    // Optional so existing legacy orders remain valid.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },

    adminNote: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
