import express from 'express';
import { getProfile, updateProfile, getAllUsers, getUserById } from '../controllers/userController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/', protect, admin, getAllUsers);
router.get('/:id', protect, admin, getUserById);

export default router;
