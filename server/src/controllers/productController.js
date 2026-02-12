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

    // Category filter - include subcategories if filtering by main category
    if (category) {
      const categoryDoc = await Category.findById(category);
      if (categoryDoc) {
        // If it's a main category, get all its subcategories
        if (!categoryDoc.parent) {
          const subcategories = await Category.find({ parent: categoryDoc._id }).select('_id');
          const categoryIds = [categoryDoc._id, ...subcategories.map(sub => sub._id)];
          query.category = { $in: categoryIds };
        } else {
          // If it's a subcategory, filter by that specific category
          query.category = category;
        }
      } else {
        query.category = category;
      }
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
    const { id } = req.params;
    
    // Validate MongoDB ObjectId format
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    const product = await Product.findById(id).populate('category', 'name slug');

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
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
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
    let { 
      name, 
      description, 
      price, 
      promoPrice, 
      category, 
      images, 
      stock, 
      sku, 
      tags, 
      featured,
      hasVariants,
      variantAttributes,
      variants
    } = req.body;

    // Parse multilingual name and description if they are JSON strings
    if (typeof name === 'string' && name.startsWith('{')) {
      try {
        name = JSON.parse(name);
      } catch (e) {
        // If parsing fails, keep as string (backward compatibility)
      }
    }
    if (typeof description === 'string' && description.startsWith('{')) {
      try {
        description = JSON.parse(description);
      } catch (e) {
        // If parsing fails, keep as string (backward compatibility)
      }
    }

    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Handle uploaded images
    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map(file => `/uploads/${file.filename}`);
    } else if (images) {
      // Support both uploaded files and URL strings
      const imageArray = Array.isArray(images) ? images : images.split(',').map((url) => url.trim()).filter((url) => url);
      imagePaths = imageArray;
    }

    // Build product data
    const productData = {
      name,
      description,
      category,
      images: imagePaths,
      sku,
      tags: tags || [],
      featured: featured || false,
      hasVariants: hasVariants || false,
    };

    // If product has variants, don't require price/stock at product level
    if (hasVariants) {
      // Parse variant attributes and variants from JSON strings if needed
      let parsedVariantAttributes = variantAttributes;
      let parsedVariants = variants;
      
      if (typeof variantAttributes === 'string') {
        try {
          parsedVariantAttributes = JSON.parse(variantAttributes);
        } catch (e) {
          parsedVariantAttributes = [];
        }
      }
      
      if (typeof variants === 'string') {
        try {
          parsedVariants = JSON.parse(variants);
        } catch (e) {
          parsedVariants = [];
        }
      }

      // Handle variant images
      if (req.files) {
        const variantImageFiles = req.files.filter(file => file.fieldname && file.fieldname.startsWith('variantImage_'));
        const productImageFiles = req.files.filter(file => file.fieldname === 'productImages' || !file.fieldname.startsWith('variantImage_'));
        
        // Process variant images
        variantImageFiles.forEach(file => {
          const match = file.fieldname.match(/variantImage_(\d+)/);
          if (match) {
            const variantIndex = parseInt(match[1]);
            if (parsedVariants && parsedVariants[variantIndex]) {
              parsedVariants[variantIndex].image = `/uploads/${file.filename}`;
            }
          }
        });
        
        // Process product images
        if (productImageFiles.length > 0) {
          imagePaths = productImageFiles.map(file => `/uploads/${file.filename}`);
        }
      }

      productData.variantAttributes = parsedVariantAttributes || [];
      productData.variants = parsedVariants || [];
      // Price and stock are optional when hasVariants is true
      if (price !== undefined) productData.price = parseFloat(price);
      if (stock !== undefined) productData.stock = stock;
    } else {
      // Price is required for products without variants
      const finalPrice = parseFloat(price);
      const finalPromoPrice = promoPrice && promoPrice > 0 ? parseFloat(promoPrice) : null;
      productData.price = finalPrice;
      productData.promoPrice = finalPromoPrice;
      productData.stock = stock || 0;
    }

    productData.oldPrice = null; // Not used anymore

    const product = await Product.create(productData);

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
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
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
    let { 
      name, 
      description, 
      price, 
      promoPrice, 
      category, 
      images, 
      stock, 
      sku, 
      tags, 
      featured, 
      rating,
      hasVariants,
      variantAttributes,
      variants
    } = req.body;

    // Parse multilingual name and description if they are JSON strings
    if (typeof name === 'string' && name.startsWith('{')) {
      try {
        name = JSON.parse(name);
      } catch (e) {
        // If parsing fails, keep as string (backward compatibility)
      }
    }
    if (typeof description === 'string' && description.startsWith('{')) {
      try {
        description = JSON.parse(description);
      } catch (e) {
        // If parsing fails, keep as string (backward compatibility)
      }
    }

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

    // Handle uploaded images
    // First, get the existing images to keep (sent from frontend)
    let finalImages = [];
    if (images !== undefined) {
      // Parse images from JSON string or array
      if (typeof images === 'string') {
        try {
          finalImages = JSON.parse(images);
        } catch (e) {
          // If not JSON, treat as comma-separated string
          finalImages = images.split(',').map((url) => url.trim()).filter((url) => url);
        }
      } else if (Array.isArray(images)) {
        finalImages = images;
      }
    }
    
    // Add new uploaded images to the final images array
    if (req.files && req.files.length > 0) {
      const newImagePaths = req.files.map(file => `/uploads/${file.filename}`);
      finalImages = [...finalImages, ...newImagePaths];
    }
    
    // Replace product images with final images array
    if (images !== undefined || (req.files && req.files.length > 0)) {
      product.images = finalImages;
    }

    // Update fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (category) product.category = category;
    if (sku) product.sku = sku;
    if (tags) product.tags = tags;
    if (featured !== undefined) product.featured = featured;
    if (rating !== undefined) product.rating = rating;
    product.oldPrice = null; // Not used anymore

    // Handle variants
    if (hasVariants !== undefined) {
      product.hasVariants = hasVariants;
      
      if (hasVariants) {
        // Parse variant attributes and variants from JSON strings if needed
        let parsedVariantAttributes = variantAttributes;
        let parsedVariants = variants;
        
        if (typeof variantAttributes === 'string') {
          try {
            parsedVariantAttributes = JSON.parse(variantAttributes);
          } catch (e) {
            parsedVariantAttributes = product.variantAttributes || [];
          }
        }
        
        if (typeof variants === 'string') {
          try {
            parsedVariants = JSON.parse(variants);
          } catch (e) {
            parsedVariants = product.variants || [];
          }
        }

        // Handle variant images
        if (req.files) {
          const variantImageFiles = req.files.filter(file => file.fieldname && file.fieldname.startsWith('variantImage_'));
          
          // Process variant images
          variantImageFiles.forEach(file => {
            const match = file.fieldname.match(/variantImage_(\d+)/);
            if (match) {
              const variantIndex = parseInt(match[1]);
              if (parsedVariants && parsedVariants[variantIndex]) {
                parsedVariants[variantIndex].image = `/uploads/${file.filename}`;
              }
            }
          });
        }

        // Product has variants
        product.variantAttributes = parsedVariantAttributes || [];
        product.variants = parsedVariants || [];
        // Price and stock are optional when hasVariants is true
        if (price !== undefined) product.price = parseFloat(price);
        if (stock !== undefined) product.stock = stock;
        if (promoPrice !== undefined) product.promoPrice = promoPrice && promoPrice > 0 ? parseFloat(promoPrice) : null;
      } else {
        // Product doesn't have variants, price and stock are required
        if (price !== undefined) product.price = parseFloat(price);
        if (stock !== undefined) product.stock = stock;
        const finalPromoPrice = promoPrice !== undefined ? (promoPrice && promoPrice > 0 ? parseFloat(promoPrice) : null) : product.promoPrice;
        product.promoPrice = finalPromoPrice;
        // Clear variants
        product.variantAttributes = [];
        product.variants = [];
      }
    } else {
      // hasVariants not being updated, handle price/stock based on current state
      if (!product.hasVariants) {
        // Product doesn't have variants, update price/stock normally
        if (price !== undefined) product.price = parseFloat(price);
        if (stock !== undefined) product.stock = stock;
        if (promoPrice !== undefined) {
          product.promoPrice = promoPrice && promoPrice > 0 ? parseFloat(promoPrice) : null;
        }
      } else {
        // Product has variants, price/stock are optional
        if (price !== undefined) product.price = parseFloat(price);
        if (stock !== undefined) product.stock = stock;
        if (promoPrice !== undefined) {
          product.promoPrice = promoPrice && promoPrice > 0 ? parseFloat(promoPrice) : null;
        }
        // Update variants if provided
        if (variantAttributes !== undefined) {
          let parsedVariantAttributes = variantAttributes;
          if (typeof variantAttributes === 'string') {
            try {
              parsedVariantAttributes = JSON.parse(variantAttributes);
            } catch (e) {
              parsedVariantAttributes = product.variantAttributes || [];
            }
          }
          product.variantAttributes = parsedVariantAttributes;
        }
        if (variants !== undefined) {
          let parsedVariants = variants;
          if (typeof variants === 'string') {
            try {
              parsedVariants = JSON.parse(variants);
            } catch (e) {
              parsedVariants = product.variants || [];
            }
          }

          // Handle variant images
          if (req.files) {
            const variantImageFiles = req.files.filter(file => file.fieldname && file.fieldname.startsWith('variantImage_'));
            
            // Process variant images
            variantImageFiles.forEach(file => {
              const match = file.fieldname.match(/variantImage_(\d+)/);
              if (match) {
                const variantIndex = parseInt(match[1]);
                if (parsedVariants && parsedVariants[variantIndex]) {
                  parsedVariants[variantIndex].image = `/uploads/${file.filename}`;
                }
              }
            });
          }

          product.variants = parsedVariants;
        }
      }
    }

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
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
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
