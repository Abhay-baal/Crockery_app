const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("../models/Product");
const Category = require("../models/Category");

const products = [
  {
    name: "Classic White Dinner Set",
    slug: "classic-white-dinner-set",
    categorySlug: "dinner-sets",
    description: "Elegant white dinner set for everyday dining and special occasions.",
    mrp: 1899,
    price: 1499,
    stock: 25,
    sku: "MBS-DIN-001",
  },
  {
    name: "Ceramic Tea Cup Set",
    slug: "ceramic-tea-cup-set",
    categorySlug: "tea-sets",
    description: "Beautiful ceramic tea cups designed for everyday tea and coffee moments.",
    mrp: 899,
    price: 699,
    stock: 30,
    sku: "MBS-TEA-002",
  },
  {
    name: "Premium Glass Storage Jars",
    slug: "premium-glass-storage-jars",
    categorySlug: "storage",
    description: "Clean and practical glass storage jars for your kitchen essentials.",
    mrp: 1199,
    price: 899,
    stock: 20,
    sku: "MBS-STR-003",
  },
  {
    name: "Non-Stick Kadhai",
    slug: "non-stick-kadhai",
    categorySlug: "kadhai-pans",
    description: "Durable non-stick kadhai for comfortable everyday cooking.",
    mrp: 1499,
    price: 1199,
    stock: 18,
    sku: "MBS-KAD-004",
  },
  {
    name: "Elegant Serving Bowl Set",
    slug: "elegant-serving-bowl-set",
    categorySlug: "serving-sets",
    description: "Stylish serving bowls made for family meals and entertaining guests.",
    mrp: 999,
    price: 799,
    stock: 22,
    sku: "MBS-SRV-005",
  },
  {
    name: "Stainless Steel Cookware Set",
    slug: "stainless-steel-cookware-set",
    categorySlug: "cookware",
    description: "Reliable stainless steel cookware set for everyday Indian cooking.",
    mrp: 2999,
    price: 2499,
    stock: 15,
    sku: "MBS-CWK-006",
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Connected to MongoDB");

    // Remove only products created by this seed.
    for (const item of products) {
      await Product.deleteOne({ sku: item.sku });
    }

    // Clear existing recently-added state.
    await Product.updateMany(
      { isRecentlyAdded: true },
      {
        $set: {
          isRecentlyAdded: false,
          recentlyAddedAt: null,
        },
      }
    );

    const created = [];

    for (let index = 0; index < products.length; index++) {
      const item = products[index];

      const category = await Category.findOne({
        slug: item.categorySlug,
        isActive: true,
      });

      if (!category) {
        console.log(
          `Skipping ${item.name}: category "${item.categorySlug}" not found`
        );
        continue;
      }

      const product = await Product.create({
        name: item.name,
        slug: item.slug,
        category: category._id,
        description: item.description,
        images: [],
        mrp: item.mrp,
        price: item.price,
        stock: item.stock,
        sku: item.sku,
        isAvailable: true,
        isRecentlyAdded: true,
        recentlyAddedAt: new Date(Date.now() - (products.length - index) * 1000),
      });

      created.push(product.name);
    }

    console.log("");
    console.log("======================================");
    console.log("Recently Added products created");
    console.log("======================================");

    created.forEach((name, index) => {
      console.log(`${index + 1}. ${name}`);
    });

    console.log("");
    console.log(`Total: ${created.length}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seed();
