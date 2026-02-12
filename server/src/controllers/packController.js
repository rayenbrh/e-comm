import Pack from '../models/Pack.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @route   GET /api/packs
 * @desc    Get all active packs
 * @access  Public
 */
export const getPacks = asyncHandler(async (req, res) => {
  const { featured } = req.query;
  
  const query = { active: true };
  if (featured === 'true') {
    query.featured = true;
  }

  // Check if pack is still valid (endDate check)
  const now = new Date();
  const packs = await Pack.find({
    ...query,
    $or: [
      { endDate: null },
      { endDate: { $gte: now } },
    ],
    startDate: { $lte: now },
  })
    .populate('products.product', 'name price images stock')
    .sort({ featured: -1, createdAt: -1 });

  res.json({
    success: true,
    packs,
  });
});

/**
 * @route   GET /api/packs/:id
 * @desc    Get single pack
 * @access  Public
 */
export const getPack = asyncHandler(async (req, res) => {
  const pack = await Pack.findById(req.params.id)
    .populate('products.product');

  if (!pack || !pack.active) {
    return res.status(404).json({
      success: false,
      message: 'Pack not found',
    });
  }

  res.json({
    success: true,
    pack,
  });
});

/**
 * @route   GET /api/packs/admin/all
 * @desc    Get all packs (including inactive) - Admin only
 * @access  Private/Admin
 */
export const getAllPacks = asyncHandler(async (req, res) => {
  const packs = await Pack.find()
    .populate('products.product', 'name price images stock')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    packs,
  });
});

/**
 * @route   POST /api/packs
 * @desc    Create a new pack
 * @access  Private/Admin
 */
export const createPack = asyncHandler(async (req, res) => {
  let {
    name,
    description,
    products,
    originalPrice,
    discountPrice,
    discountPercentage,
    startDate,
    endDate,
    featured,
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

  // Get image path if file was uploaded
  let imagePath = null;
  if (req.file) {
    imagePath = `/uploads/${req.file.filename}`;
  } else if (req.body.image) {
    // Fallback to URL if provided
    imagePath = req.body.image;
  }

  // Parse products if it's a string (from FormData)
  let productsArray = products;
  if (typeof products === 'string') {
    try {
      productsArray = JSON.parse(products);
    } catch (e) {
      productsArray = [];
    }
  }

  // Validate products exist
  if (productsArray && productsArray.length > 0) {
    for (const item of productsArray) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.product} not found`,
        });
      }
    }
  }

  const pack = await Pack.create({
    name,
    description,
    products: productsArray || [],
    originalPrice: parseFloat(originalPrice),
    discountPrice: parseFloat(discountPrice),
    discountPercentage: parseFloat(discountPercentage),
    image: imagePath,
    startDate: startDate ? new Date(startDate) : Date.now(),
    endDate: endDate ? new Date(endDate) : null,
    featured: featured === 'true' || featured === true,
    active: true,
  });

  const populatedPack = await Pack.findById(pack._id)
    .populate('products.product', 'name price images stock');

  res.status(201).json({
    success: true,
    message: 'Pack created successfully',
    pack: populatedPack,
  });
});

/**
 * @route   PUT /api/packs/:id
 * @desc    Update a pack
 * @access  Private/Admin
 */
export const updatePack = asyncHandler(async (req, res) => {
  const pack = await Pack.findById(req.params.id);

  if (!pack) {
    return res.status(404).json({
      success: false,
      message: 'Pack not found',
    });
  }

  // Handle image upload
  if (req.file) {
    // Delete old image if it exists and is in uploads folder
    if (pack.image && pack.image.startsWith('/uploads/')) {
      const oldFilePath = path.join(__dirname, '../../', pack.image);
      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
        } catch (error) {
          console.error('Error deleting old pack image:', error);
        }
      }
    }
    pack.image = `/uploads/${req.file.filename}`;
  } else if (req.body.image !== undefined) {
    // If image is explicitly set to empty string, remove it
    if (req.body.image === '' || req.body.image === null) {
      // Delete old image if it exists
      if (pack.image && pack.image.startsWith('/uploads/')) {
        const oldFilePath = path.join(__dirname, '../../', pack.image);
        if (fs.existsSync(oldFilePath)) {
          try {
            fs.unlinkSync(oldFilePath);
          } catch (error) {
            console.error('Error deleting old pack image:', error);
          }
        }
      }
      pack.image = null;
    } else if (req.body.image && req.body.image !== pack.image) {
      // Update image URL if provided and different
      pack.image = req.body.image;
    }
  }

  // Parse products if it's a string (from FormData)
  if (req.body.products) {
    let productsArray = req.body.products;
    if (typeof productsArray === 'string') {
      try {
        productsArray = JSON.parse(productsArray);
      } catch (e) {
        productsArray = [];
      }
    }

    // Validate products if provided
    if (productsArray && productsArray.length > 0) {
      for (const item of productsArray) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(400).json({
            success: false,
            message: `Product ${item.product} not found`,
          });
        }
      }
    }
    pack.products = productsArray;
  }

  // Parse multilingual name and description if they are JSON strings
  if (req.body.name !== undefined) {
    let name = req.body.name;
    if (typeof name === 'string' && name.startsWith('{')) {
      try {
        name = JSON.parse(name);
      } catch (e) {
        // If parsing fails, keep as string (backward compatibility)
      }
    }
    pack.name = name;
  }
  
  if (req.body.description !== undefined) {
    let description = req.body.description;
    if (typeof description === 'string' && description.startsWith('{')) {
      try {
        description = JSON.parse(description);
      } catch (e) {
        // If parsing fails, keep as string (backward compatibility)
      }
    }
    pack.description = description;
  }
  if (req.body.originalPrice) pack.originalPrice = parseFloat(req.body.originalPrice);
  if (req.body.discountPrice) pack.discountPrice = parseFloat(req.body.discountPrice);
  if (req.body.discountPercentage) pack.discountPercentage = parseFloat(req.body.discountPercentage);
  if (req.body.startDate) pack.startDate = new Date(req.body.startDate);
  if (req.body.endDate !== undefined) pack.endDate = req.body.endDate ? new Date(req.body.endDate) : null;
  if (req.body.featured !== undefined) pack.featured = req.body.featured === 'true' || req.body.featured === true;
  if (req.body.active !== undefined) pack.active = req.body.active === 'true' || req.body.active === true;

  await pack.save();

  const populatedPack = await Pack.findById(pack._id)
    .populate('products.product', 'name price images stock');

  res.json({
    success: true,
    message: 'Pack updated successfully',
    pack: populatedPack,
  });
});

/**
 * @route   DELETE /api/packs/:id
 * @desc    Delete a pack
 * @access  Private/Admin
 */
export const deletePack = asyncHandler(async (req, res) => {
  const pack = await Pack.findById(req.params.id);

  if (!pack) {
    return res.status(404).json({
      success: false,
      message: 'Pack not found',
    });
  }

  await pack.deleteOne();

  res.json({
    success: true,
    message: 'Pack deleted successfully',
  });
});

/**
 * @route   PUT /api/packs/:id/toggle-active
 * @desc    Toggle pack active status
 * @access  Private/Admin
 */
export const togglePackActive = asyncHandler(async (req, res) => {
  const pack = await Pack.findById(req.params.id);

  if (!pack) {
    return res.status(404).json({
      success: false,
      message: 'Pack not found',
    });
  }

  pack.active = !pack.active;
  await pack.save();

  res.json({
    success: true,
    message: `Pack ${pack.active ? 'activated' : 'deactivated'} successfully`,
    pack,
  });
});

