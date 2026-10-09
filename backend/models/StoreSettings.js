const mongoose = require("mongoose");

const storeSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: "main" },
    heroTitle: {
      type: String,
      default: "Beautiful essentials for every kitchen.",
    },
    heroDescription: {
      type: String,
      default:
        "Discover quality bartan, crockery and everyday kitchen essentials at Magotra Bartan Store — bringing practical products and timeless style to your home.",
    },
    heroImage: { type: String, default: "" },
    primaryButton: { type: String, default: "Shop products" },
    secondaryButton: {
      type: String,
      default: "Explore collections",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StoreSettings", storeSettingsSchema);
