import express from 'express';
import {
  getPacks,
  getPack,
  getAllPacks,
  createPack,
  updatePack,
  deletePack,
  togglePackActive,
} from '../controllers/packController.js';
import { protect, admin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { uploadPackImageMiddleware } from '../middleware/upload.js';

// Wrapper to handle multer errors
const handleMulterError = (middleware) => {
  return (req, res, next) => {
    middleware(req, res, (err) => {
      if (err) {
        return next(err);
      }
      next();
    });
  };
};

const router = express.Router();

// Public routes
router.get('/', asyncHandler(getPacks));
router.get('/:id', asyncHandler(getPack));

// Admin routes
router.get('/admin/all', protect, admin, asyncHandler(getAllPacks));
router.post('/', protect, admin, handleMulterError(uploadPackImageMiddleware), asyncHandler(createPack));
router.put('/:id', protect, admin, handleMulterError(uploadPackImageMiddleware), asyncHandler(updatePack));
router.delete('/:id', protect, admin, asyncHandler(deletePack));
router.put('/:id/toggle-active', protect, admin, asyncHandler(togglePackActive));

export default router;

