const { body, validationResult } = require('express-validator');

// Middleware to handle validation result
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return res.status(400).json({
      success: false,
      message: errorDetails[0]?.message || 'Validation error',
      errors: errorDetails,
    });
  }
  next();
};

// Auth validation rules
const registerRules = [
  body('name').trim().notEmpty().withMessage('Full Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').trim().isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('confirmPassword')
    .notEmpty().withMessage('Please confirm your password')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Confirm password does not match password');
      }
      return true;
    }),
  body('phone').trim().matches(/^[\+]?[0-9\s-]{7,15}$/).withMessage('Please provide a valid phone number (e.g. 9812345678)'),
  body('role')
    .optional()
    .isIn(['donor', 'receiver', 'volunteer'])
    .withMessage('Invalid role specified. Only donor, receiver, and volunteer can register publicly.'),
  validate,
];

const loginRules = [
  body('email').trim().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

// Food donation validation rules
const donationRules = [
  body('foodName').trim().notEmpty().withMessage('Food name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('quantity').isNumeric().withMessage('Quantity must be a valid number').custom((val) => val > 0).withMessage('Quantity must be greater than 0'),
  body('unit').isIn(['kg', 'grams', 'litres', 'packets', 'bags', 'pieces', 'meals', 'boxes', 'servings']).withMessage('Invalid quantity unit'),
  body('foodType').isIn(['Veg', 'Non-Veg', 'Vegan', 'Egg']).withMessage('Invalid food type'),
  body('expiryDate').notEmpty().withMessage('Expiry date is required').isISO8601().withMessage('Expiry date must be a valid ISO date'),
  body('pickupDate').notEmpty().withMessage('Pickup date is required').isISO8601().withMessage('Pickup date must be a valid ISO date'),
  body('pickupTime').trim().notEmpty().withMessage('Pickup time is required'),
  body('pickupAddress').trim().notEmpty().withMessage('Pickup address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('pincode').matches(/^\d{6}$/).withMessage('Pincode must be 6 digits'),
  body('donationMethod')
    .optional()
    .isIn(['ngo_pickup', 'self_delivery', 'arrange_pickup', 'choose_ngo', 'need_help'])
    .withMessage('Invalid donation method'),
  body('isRecurring').optional().isBoolean().withMessage('isRecurring must be boolean'),
  body('isAnonymous').optional().isBoolean().withMessage('isAnonymous must be boolean'),
  validate,
];

// Food request validation rules
const requestRules = [
  body('donationId').notEmpty().withMessage('Donation ID is required').isMongoId().withMessage('Invalid donation ID'),
  body('requestedQuantity').isNumeric().withMessage('Requested quantity must be a number').custom((val) => val > 0).withMessage('Requested quantity must be greater than 0'),
  body('message').trim().notEmpty().withMessage('Please provide a message or reason for the request'),
  validate,
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  donationRules,
  requestRules,
};
