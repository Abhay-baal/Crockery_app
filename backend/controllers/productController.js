const Product = require("../models/Product");
const Category = require("../models/Category");

const createProduct = async (req, res) => {
  try {
    const {
      name,
      slug,
      category,
      description,
      images,
      mrp,
      price,
      stock,
      sku,
      isAvailable,
      isRecentlyAdded,
    } = req.body;

    if (!name || !slug || !category || mrp === undefined || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, slug, category, MRP and price are required",
      });
    }

    const categoryExists = await Category.findById(category);

    if (!categoryExists || !categoryExists.isActive) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive category",
      });
    }

    const existingProduct = await Product.findOne({
      $or: [
        { slug: slug.toLowerCase().trim() },
        ...(sku ? [{ sku: sku.trim() }] : []),
      ],
    });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "Product with this slug or SKU already exists",
      });
    }

    if (price > mrp) {
      return res.status(400).json({
        success: false,
        message: "Selling price cannot be greater than MRP",
      });
    }

    const product = await Product.create({
      name: name.trim(),
      slug: slug.toLowerCase().trim(),
      category,
      description: description || "",
      images: Array.isArray(images) ? images : [],
      mrp,
      price,
      stock: stock || 0,
      sku: sku ? sku.trim() : undefined,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      isRecentlyAdded: isRecentlyAdded === true,
      recentlyAddedAt: isRecentlyAdded === true ? new Date() : null,
    });

    const populatedProduct = await Product.findById(product._id).populate(
      "category",
      "name slug"
    );

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: populatedProduct,
    });
  } catch (error) {
    console.error("Create product error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isAvailable: true })
      .populate("category", "name slug")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to get products",
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isAvailable: true,
    }).populate("category", "name slug");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to get product",
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      slug,
      category,
      description,
      images,
      mrp,
      price,
      stock,
      sku,
      isAvailable,
      isRecentlyAdded,
    } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (category !== undefined) {
      const categoryExists = await Category.findById(category);

      if (!categoryExists || !categoryExists.isActive) {
        return res.status(400).json({
          success: false,
          message: "Invalid or inactive category",
        });
      }

      product.category = category;
    }

    if (name !== undefined) {
      product.name = name.trim();
    }

    if (slug !== undefined) {
      product.slug = slug.toLowerCase().trim();
    }

    if (description !== undefined) {
      product.description = description;
    }

    if (images !== undefined) {
      product.images = Array.isArray(images) ? images : [];
    }

    if (mrp !== undefined) {
      product.mrp = mrp;
    }

    if (price !== undefined) {
      product.price = price;
    }

    if (product.price > product.mrp) {
      return res.status(400).json({
        success: false,
        message: "Selling price cannot be greater than MRP",
      });
    }

    if (stock !== undefined) {
      product.stock = stock;
    }

    if (sku !== undefined) {
      product.sku = sku.trim();
    }

    if (isAvailable !== undefined) {
      product.isAvailable = isAvailable;
    }

    if (isRecentlyAdded !== undefined) {
      if (isRecentlyAdded === true && product.isRecentlyAdded !== true) {
        // Remove the oldest recently-added product if there are already 6.
        const recentProducts = await Product.find({
          isRecentlyAdded: true,
          _id: { $ne: product._id },
        })
          .sort({ recentlyAddedAt: 1 })
          .limit(6);

        if (recentProducts.length >= 6) {
          const oldest = recentProducts[0];

          oldest.isRecentlyAdded = false;
          oldest.recentlyAddedAt = null;

          await oldest.save();
        }

        product.isRecentlyAdded = true;
        product.recentlyAddedAt = new Date();
      }

      if (isRecentlyAdded === false) {
        product.isRecentlyAdded = false;
        product.recentlyAddedAt = null;
      }
    }

    await product.save();

    const updatedProduct = await Product.findById(product._id).populate(
      "category",
      "name slug"
    );

    res.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Update product error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};

const getRecentlyAdded = async (req, res) => {
  try {
    const products = await Product.find({
      isAvailable: true,
      isRecentlyAdded: true,
    })
      .populate("category", "name slug")
      .sort({ recentlyAddedAt: 1 });

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get recently added error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to get recently added products",
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.isAvailable = false;

    await product.save();

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  getRecentlyAdded,
  updateProduct,
  deleteProduct,
};
