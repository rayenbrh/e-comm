import express from 'express';
import {
  getSettings,
  getSetting,
  updateSetting,
  getHeroImage,
  uploadHeroImage,
  uploadHeroImages,
  deleteHeroImage,
} from '../controllers/settingsController.js';
import { protect, admin } from '../middleware/auth.js';
import { uploadHeroImage as uploadSingleMiddleware, uploadHeroImages as uploadMultipleMiddleware } from '../middleware/upload.js';
import { asyncHandler } from '../middleware/errorHandler.js';

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
router.get('/hero-image', getHeroImage);

// Admin routes
router.get('/', protect, admin, getSettings);
router.get('/:key', protect, admin, getSetting);
router.put('/', protect, admin, updateSetting);
router.post('/upload-hero-image', protect, admin, handleMulterError(uploadSingleMiddleware), asyncHandler(uploadHeroImage));
router.post('/upload-hero-images', protect, admin, handleMulterError(uploadMultipleMiddleware), asyncHandler(uploadHeroImages));
router.post('/delete-hero-image', protect, admin, deleteHeroImage);

export default router;

