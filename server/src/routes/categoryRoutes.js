import express from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect, admin } from '../middleware/auth.js';
import { createCategoryValidation, validate } from '../middleware/validator.js';
import { uploadCategoryImageMiddleware } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.post('/', protect, admin, uploadCategoryImageMiddleware, createCategoryValidation, validate, createCategory);
router.put('/:id', protect, admin, uploadCategoryImageMiddleware, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

export default router;
