import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/auth.js';
import { createOrderValidation, validate } from '../middleware/validator.js';

const router = express.Router();

// Public route for guest checkout
router.post('/', createOrderValidation, validate, (req, res, next) => {
  // Make protect middleware optional
  if (req.cookies.accessToken || req.cookies.refreshToken) {
    return protect(req, res, next);
  }
  next();
}, createOrder);

router.get('/', protect, getOrders);
router.get('/stats/overview', protect, admin, getOrderStats);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, admin, updateOrderStatus);

export default router;
