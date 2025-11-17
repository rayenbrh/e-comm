import Category from '../models/Category.js';
import Product from '../models/Product.js';

/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Public
 */
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });

    res.json({
      success: true,
      count: categories.length,
      categories,
    });
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
 * @desc    Create a new category
 * @access  Private/Admin
 */
export const createCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    const category = await Category.create({
      name,
      description: description || '',
      image: image || '',
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
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
 * @desc    Update a category
 * @access  Private/Admin
 */
export const updateCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;

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
 * @desc    Delete a category
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
