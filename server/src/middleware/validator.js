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
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('stock').isInt({ min: 0 }).withMessage('Valid stock quantity is required'),
];

/**
 * Order validation rules
 */
export const createOrderValidation = [
  body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
  body('items.*.product').notEmpty().withMessage('Product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('guestInfo.name').if(body('user').not().exists()).notEmpty().withMessage('Name is required'),
  body('guestInfo.email').if(body('user').not().exists()).isEmail().withMessage('Valid email is required'),
  body('guestInfo.phone').if(body('user').not().exists()).notEmpty().withMessage('Phone is required'),
  body('guestInfo.address.street').if(body('user').not().exists()).notEmpty().withMessage('Street is required'),
  body('guestInfo.address.city').if(body('user').not().exists()).notEmpty().withMessage('City is required'),
  body('guestInfo.address.postalCode').if(body('user').not().exists()).notEmpty().withMessage('Postal code is required'),
  body('guestInfo.address.country').if(body('user').not().exists()).notEmpty().withMessage('Country is required'),
];

/**
 * Category validation rules
 */
export const createCategoryValidation = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
];
