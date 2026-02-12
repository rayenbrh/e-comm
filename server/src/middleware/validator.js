import { body, param, query, validationResult } from 'express-validator';

/**
 * Validation result checker
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * Auth validation rules
 */
export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

/**
 * Product validation rules
 */
export const createProductValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  // Price and stock are only required if product doesn't have variants
  body('price')
    .if((value, { req }) => {
      const hasVariants = req.body.hasVariants === 'true' || req.body.hasVariants === true;
      return !hasVariants;
    })
    .isFloat({ min: 0 })
    .withMessage('Valid price is required'),
  body('stock')
    .if((value, { req }) => {
      const hasVariants = req.body.hasVariants === 'true' || req.body.hasVariants === true;
      return !hasVariants;
    })
    .isInt({ min: 0 })
    .withMessage('Valid stock quantity is required'),
  // If hasVariants is true, validate variants
  body('variantAttributes')
    .if((value, { req }) => {
      const hasVariants = req.body.hasVariants === 'true' || req.body.hasVariants === true;
      return hasVariants;
    })
    .custom((value) => {
      if (!value) return false;
      try {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value;
        return Array.isArray(parsed) && parsed.length > 0;
      } catch {
        return false;
      }
    })
    .withMessage('At least one variant attribute is required when product has variants'),
  body('variants')
    .if((value, { req }) => {
      const hasVariants = req.body.hasVariants === 'true' || req.body.hasVariants === true;
      return hasVariants;
    })
    .custom((value) => {
      if (!value) return false;
      try {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value;
        return Array.isArray(parsed) && parsed.length > 0;
      } catch {
        return false;
      }
    })
    .withMessage('At least one variant is required when product has variants'),
];

/**
 * Order validation rules
 */
export const createOrderValidation = [
  body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
  body('items.*.product').notEmpty().withMessage('Product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.variantAttributes').optional().isObject().withMessage('Variant attributes must be an object'),
  // Guest info validation is handled in the controller after auth middleware
  body('guestInfo.name').optional().notEmpty().withMessage('Name is required for guest orders'),
  body('guestInfo.email').optional().isEmail().withMessage('Valid email is required for guest orders'),
  body('guestInfo.phone').optional().notEmpty().withMessage('Phone is required for guest orders'),
  body('guestInfo.address.street').optional().notEmpty().withMessage('Street is required for guest orders'),
  body('guestInfo.address.city').optional().notEmpty().withMessage('City is required for guest orders'),
  body('guestInfo.address.postalCode').optional().notEmpty().withMessage('Postal code is required for guest orders'),
  body('guestInfo.address.country').optional().notEmpty().withMessage('Country is required for guest orders'),
];

/**
 * Category validation rules
 */
export const createCategoryValidation = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
];
