const mongoose = require("mongoose");

const cloudinaryAssetSchema = new mongoose.Schema(
  {
    publicId: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    eligibleAfter: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CloudinaryAsset", cloudinaryAssetSchema);