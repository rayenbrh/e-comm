import Category from '../models/Category.js';
import Product from '../models/Product.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @route   GET /api/categories
 * @desc    Get all categories with subcategories
 * @access  Public
 */
export const getCategories = async (req, res) => {
  try {
    const { includeSubcategories } = req.query;
    
    // Get main categories (no parent)
    const mainCategories = await Category.find({ parent: null }).sort({ name: 1 });
    
    if (includeSubcategories === 'true') {
      // Populate subcategories for each main category
      const categoriesWithSubs = await Promise.all(
        mainCategories.map(async (category) => {
          const subcategories = await Category.find({ parent: category._id }).sort({ name: 1 });
          return {
            ...category.toObject(),
            subcategories,
          };
        })
      );
      
      res.json({
        success: true,
        count: mainCategories.length,
        categories: categoriesWithSubs,
      });
    } else {
      // Get all categories (main + subcategories) flat
      const allCategories = await Category.find({}).sort({ name: 1 });
      
      res.json({
        success: true,
        count: allCategories.length,
        categories: allCategories,
      });
    }
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
    });
  }
};

/**
 * @route   GET /api/categories/:id
 * @desc    Get category by ID
 * @access  Public
 */
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category',
    });
  }
};

/**
 * @route   POST /api/categories
 * @desc    Create a new category or subcategory
 * @access  Private/Admin
 */
export const createCategory = async (req, res) => {
  try {
    let { name, description, image, parent } = req.body;

    // Parse multilingual name if it's a JSON string
    if (typeof name === 'string' && name.startsWith('{')) {
      try {
        name = JSON.parse(name);
      } catch (e) {
        // If parsing fails, keep as string (backward compatibility)
      }
    }

    // Handle uploaded image
    let imagePath = '';
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    } else if (image) {
      // Support both uploaded files and URL strings
      imagePath = image;
    }

    // Validate parent if provided
    let parentCategory = null;
    if (parent) {
      parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          message: 'Parent category not found',
        });
      }
    }

    const category = await Category.create({
      name,
      description: description || '',
      image: imagePath,
      parent: parent || null,
      isSubCategory: !!parent,
    });

    res.status(201).json({
      success: true,
      message: parent ? 'Subcategory created successfully' : 'Category created successfully',
      category,
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating category',
    });
  }
};

/**
 * @route   PUT /api/categories/:id
 * @desc    Update a category or subcategory
 * @access  Private/Admin
 */
export const updateCategory = async (req, res) => {
  try {
    let { name, description, image, parent } = req.body;

    // Parse multilingual name if it's a JSON string
    if (typeof name === 'string' && name.startsWith('{')) {
      try {
        name = JSON.parse(name);
      } catch (e) {
        // If parsing fails, keep as string (backward compatibility)
      }
    }

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Validate parent if provided and different
    if (parent && parent !== category.parent?.toString()) {
      // Check if trying to set itself as parent
      if (parent === category._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Category cannot be its own parent',
        });
      }
      
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          message: 'Parent category not found',
        });
      }
      
      category.parent = parent;
      category.isSubCategory = true;
    } else if (parent === null || parent === '') {
      // Removing parent (making it a main category)
      category.parent = null;
      category.isSubCategory = false;
    }

    // Handle uploaded image
    if (req.file) {
      // Delete old image if it exists and is in uploads folder
      if (category.image && category.image.startsWith('/uploads/')) {
        const oldFilePath = path.join(__dirname, '../../', category.image);
        if (fs.existsSync(oldFilePath)) {
          try {
            fs.unlinkSync(oldFilePath);
          } catch (error) {
            console.error('Error deleting old category image:', error);
          }
        }
      }
      category.image = `/uploads/${req.file.filename}`;
    } else if (image !== undefined) {
      category.image = image;
    }

    if (name) category.name = name;
    if (description !== undefined) category.description = description;

    await category.save();

    res.json({
      success: true,
      message: 'Category updated successfully',
      category,
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating category',
    });
  }
};

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete a category or subcategory
 * @access  Private/Admin
 */
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Recursively delete all subcategories first
    const deleteSubcategories = async (parentId) => {
      const subcategories = await Category.find({ parent: parentId });
      for (const subcategory of subcategories) {
        // Recursively delete subcategories of subcategories
        await deleteSubcategories(subcategory._id);
        // Delete the subcategory image if it exists
        if (subcategory.image && subcategory.image.startsWith('/uploads/')) {
          const imagePath = path.join(__dirname, '../../', subcategory.image);
          if (fs.existsSync(imagePath)) {
            try {
              fs.unlinkSync(imagePath);
            } catch (error) {
              console.error('Error deleting subcategory image:', error);
            }
          }
        }
        await subcategory.deleteOne();
      }
    };

    // Delete all subcategories recursively
    await deleteSubcategories(category._id);

    // Update products to remove category reference (set to null or a default category)
    // First, try to find a default category (first main category)
    const defaultCategory = await Category.findOne({ parent: null });
    
    if (defaultCategory && defaultCategory._id.toString() !== category._id.toString()) {
      // Move products to default category
      await Product.updateMany(
        { category: category._id },
        { category: defaultCategory._id }
      );
    } else {
      // If no default category exists, set products category to null (they will need to be reassigned)
      await Product.updateMany(
        { category: category._id },
        { $unset: { category: 1 } }
      );
    }

    // Delete the category image if it exists
    if (category.image && category.image.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '../../', category.image);
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
        } catch (error) {
          console.error('Error deleting category image:', error);
        }
      }
    }

    await category.deleteOne();

    res.json({
      success: true,
      message: 'Category and all subcategories deleted successfully',
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
