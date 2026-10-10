const Category = require("../models/Category");
const Product = require("../models/Product");
const { cleanupUnusedCloudinaryImages } = require("../utils/cloudinaryImages");

const createCategory = async (req, res) => {
  try {
    const { name, slug, image, imagePublicId, description } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: "Name and slug are required",
      });
    }

    const existingCategory = await Category.findOne({
      $or: [
        { name: name.trim() },
        { slug: slug.toLowerCase().trim() },
      ],
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    const category = await Category.create({
      name: name.trim(),
      slug: slug.toLowerCase().trim(),
      image: image || "",
      imagePublicId: imagePublicId || "",
      description: description || "",
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create category error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to get categories",
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, image, imagePublicId, description, isActive } = req.body;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const previousImageAsset = {
      url: category.image,
      publicId: category.imagePublicId,
    };

    if (name !== undefined) {
      category.name = name.trim();
    }

    if (slug !== undefined) {
      category.slug = slug.toLowerCase().trim();
    }

    if (image !== undefined) {
      category.image = image;
    }

    if (imagePublicId !== undefined) {
      category.imagePublicId = imagePublicId;
    }

    if (description !== undefined) {
      category.description = description;
    }

    if (isActive !== undefined) {
      category.isActive = isActive;
    }

    await category.save();

    if (previousImageAsset.publicId !== category.imagePublicId) {
      await cleanupUnusedCloudinaryImages([previousImageAsset]);
    }

    res.json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update category error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update category",
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmDependentProducts } = req.body || {};
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const products = await Product.find({ category: id }).select(
      "images imagePublicIds"
    );

    if (products.length > 0 && confirmDependentProducts !== true) {
      return res.status(409).json({
        success: false,
        requiresConfirmation: true,
        dependentProductCount: products.length,
        message: `This category contains ${products.length} product${products.length === 1 ? "" : "s"}. Confirm permanent deletion of the category and all dependent products.`,
      });
    }

    const assets = [
      {
        url: category.image,
        publicId: category.imagePublicId,
      },
      ...products.flatMap((product) =>
        (product.images || []).map((url, index) => ({
          url,
          publicId: (product.imagePublicIds || [])[index] || "",
        }))
      ),
    ];

    // Remove dependent products and category from MongoDB.
    await Product.deleteMany({ category: id });
    await Category.findByIdAndDelete(id);

    // Deletes only images no longer referenced by live records.
    const cleanup = await cleanupUnusedCloudinaryImages(assets);

    if (cleanup.failed.length || cleanup.missingPublicIds.length) {
      return res.status(502).json({
        success: false,
        deleted: true,
        deletedProducts: products.length,
        message: "Category and products deleted, but required image cleanup was incomplete.",
        cleanup,
      });
    }

    return res.json({
      success: true,
      message: "Category permanently deleted",
      deletedProducts: products.length,
      cleanup,
    });
  } catch (error) {
    console.error("Delete category error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to delete category",
    });
  }
};

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};
