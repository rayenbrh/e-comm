import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getRelatedProducts,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/auth.js';
import { createProductValidation, validate } from '../middleware/validator.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.get('/:id/related', getRelatedProducts);
router.post('/', protect, admin, createProductValidation, validate, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

export default router;
