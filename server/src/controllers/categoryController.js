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
    const { name, description, image, parent } = req.body;

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
    const { name, description, image, parent } = req.body;

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

    // Check if category has subcategories
    const subcategoriesCount = await Category.countDocuments({ parent: category._id });
    if (subcategoriesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. ${subcategoriesCount} subcategory(ies) exist. Please delete subcategories first.`,
      });
    }

    // Check if any products use this category
    const productsCount = await Product.countDocuments({ category: category._id });

    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. ${productsCount} product(s) are using this category.`,
      });
    }

    await category.deleteOne();

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting category',
    });
  }
};
