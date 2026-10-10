const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      enum: ["Home", "Work", "Other"],
      default: "Home",
    },
    recipientName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    house: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    landmark: { type: String, trim: true, default: "" },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },

    addresses: {
      type: [addressSchema],
      default: [],
    },

    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
