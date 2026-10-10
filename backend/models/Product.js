const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    images: [
      {
        type: String,
      },
    ],

    imagePublicIds: [
      {
        type: String,
        default: "",
      },
    ],

    mrp: {
      type: Number,
      required: true,
      min: 0,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    sku: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    isPinned: { type: Boolean, default: false },

    isRecentlyAdded: {
      type: Boolean,
      default: false,
    },

    recentlyAddedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
