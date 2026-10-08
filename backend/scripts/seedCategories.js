require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const Category = require("../models/Category");

const categories = [
  { name: "Dinner Sets", slug: "dinner-sets" },
  { name: "Tea Sets", slug: "tea-sets" },
  { name: "Glassware", slug: "glassware" },
  { name: "Serving Sets", slug: "serving-sets" },
  { name: "Cookware", slug: "cookware" },
  { name: "Kadhai & Pans", slug: "kadhai-pans" },
  { name: "Pressure Cookers", slug: "pressure-cookers" },
  { name: "Kitchen Tools", slug: "kitchen-tools" },
  { name: "Storage", slug: "storage" },
  { name: "Plates & Bowls", slug: "plates-bowls" },
  { name: "Cups & Mugs", slug: "cups-mugs" },
  { name: "Water Bottles", slug: "water-bottles" },
  { name: "Kitchen Accessories", slug: "kitchen-accessories" },
  { name: "Home & Dining", slug: "home-dining" },
  { name: "Kitchen Essentials", slug: "kitchen-essentials" },
];

async function seedCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB connected");

    let added = 0;
    let skipped = 0;

    for (const categoryData of categories) {
      const existing = await Category.findOne({
        slug: categoryData.slug,
      });

      if (existing) {
        console.log(`⏭️  Already exists: ${categoryData.name}`);
        skipped++;
        continue;
      }

      await Category.create({
        ...categoryData,
        image: "",
        description: "",
        isActive: true,
      });

      console.log(`✅ Added: ${categoryData.name}`);
      added++;
    }

    console.log("");
    console.log("================================");
    console.log(`✅ Added: ${added}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`📦 Total planned: ${categories.length}`);
    console.log("================================");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedCategories();
