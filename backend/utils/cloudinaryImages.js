const cloudinary = require("cloudinary").v2;
const CloudinaryAsset = require("../models/CloudinaryAsset");
const Category = require("../models/Category");
const Product = require("../models/Product");
const StoreSettings = require("../models/StoreSettings");

const ORPHAN_GRACE_PERIOD_MS = 24 * 60 * 60 * 1000;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function registerCloudinaryUpload(asset) {
  if (
    !asset ||
    typeof asset.publicId !== "string" ||
    !asset.publicId.startsWith("crockery/") ||
    typeof asset.url !== "string" ||
    !asset.url
  ) return;

  await CloudinaryAsset.updateOne(
    { publicId: asset.publicId },
    {
      $set: { url: asset.url },
      $setOnInsert: {
        eligibleAfter: new Date(Date.now() + ORPHAN_GRACE_PERIOD_MS),
      },
    },
    { upsert: true }
  );
}

async function cleanupUnusedCloudinaryImages(assets = []) {
  const seen = new Set();
  const report = {
    deleted: [],
    shared: [],
    missingPublicIds: [],
    failed: [],
  };

  for (const asset of assets) {
    const publicId = asset?.publicId;
    if (!publicId) {
      if (asset?.url) report.missingPublicIds.push(asset.url);
      continue;
    }

    if (seen.has(publicId)) continue;

    seen.add(publicId);

    try {
      const [categoryUse, productUse, settingsUse] = await Promise.all([
        Category.exists({ imagePublicId: publicId }),
        Product.exists({ imagePublicIds: publicId }),
        StoreSettings.exists({ heroImagePublicId: publicId }),
      ]);

      // Never remove an image still used by a live record.
      if (categoryUse || productUse || settingsUse) {
        report.shared.push(publicId);
        continue;
      }

      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
      });

      if (result.result === "ok" || result.result === "not found") {
        await CloudinaryAsset.deleteOne({ publicId });
        console.log("Cloudinary image cleanup:", publicId, result.result);
        report.deleted.push(publicId);
      } else {
        console.error("Cloudinary image was not deleted:", publicId, result);
        report.failed.push({ publicId, message: `Cloudinary returned ${result.result}` });
      }
    } catch (error) {
      console.error(
        "Cloudinary image cleanup failed:",
        publicId,
        error.message
      );
      report.failed.push({ publicId, message: error.message });
    }
  }

  return report;
}

// Keep bulk orphan cleanup disabled; deleting unknown uploads needs
// a separate, verified reference scan.
async function cleanupOrphanedCloudinaryImages() {
  return { disabled: true, deleted: 0 };
}

module.exports = {
  cleanupUnusedCloudinaryImages,
  cleanupOrphanedCloudinaryImages,
  registerCloudinaryUpload,
};
