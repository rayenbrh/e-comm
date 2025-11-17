import Product from '../models/Product.js';
import Category from '../models/Category.js';

/**
 * @route   GET /api/products
 * @desc    Get all products with filtering, search, and pagination
 * @access  Public
 */
export const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      minRating,
      sort,
      page = 1,
      limit = 12,
      featured,
    } = req.query;

    // Build query
    const query = {};

    // Search
    if (search) {
      query.$text = { $search: search };
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Rating filter
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    // Featured filter
    if (featured === 'true') {
      query.featured = true;
    }

    // Sort options
    let sortOption = {};
    switch (sort) {
      case 'price-asc':
        sortOption = { price: 1 };
        break;
      case 'price-desc':
        sortOption = { price: -1 };
        break;
      case 'rating':
        sortOption = { rating: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
    });
  }
};

/**
 * @route   GET /api/products/:id
 * @desc    Get product by ID
 * @access  Public
 */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
    });
  }
};

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private/Admin
 */
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, images, stock, sku, tags, featured } = req.body;

    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      images: images || [],
      stock,
      sku,
      tags: tags || [],
      featured: featured || false,
    });

    await product.populate('category', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
    });
  }
};

/**
 * @route   PUT /api/products/:id
 * @desc    Update a product
 * @access  Private/Admin
 */
export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, images, stock, sku, tags, featured, rating } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Verify category exists if being updated
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }
    }

    // Update fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = price;
    if (category) product.category = category;
    if (images) product.images = images;
    if (stock !== undefined) product.stock = stock;
    if (sku) product.sku = sku;
    if (tags) product.tags = tags;
    if (featured !== undefined) product.featured = featured;
    if (rating !== undefined) product.rating = rating;

    await product.save();
    await product.populate('category', 'name slug');

    res.json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
    });
  }
};

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product
 * @access  Private/Admin
 */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
    });
  }
};

/**
 * @route   GET /api/products/:id/related
 * @desc    Get related products
 * @access  Public
 */
export const getRelatedProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Find products in same category, excluding current product
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    })
      .populate('category', 'name slug')
      .limit(4);

    res.json({
      success: true,
      products: relatedProducts,
    });
  } catch (error) {
    console.error('Get related products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching related products',
    });
  }
};
