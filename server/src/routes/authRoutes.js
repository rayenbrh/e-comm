import express from 'express';
import { register, login, logout, getCurrentUser } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { registerValidation, loginValidation, validate } from '../middleware/validator.js';

const router = express.Router();

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/logout', logout);
router.get('/me', protect, getCurrentUser);

export default router;
