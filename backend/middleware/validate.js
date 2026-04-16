const { body, param, query, validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

/**
 * Middleware to handle validation errors from express-validator
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 422, 'Validation failed', errors.array());
  }
  next();
};

// ─── Login Validators ─────────────────────────────────────────────────────────
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors,
];

// ─── Create User Validators ───────────────────────────────────────────────────
const validateCreateUser = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'user']).withMessage('Role must be admin, manager, or user'),
  handleValidationErrors,
];

// ─── Update User Validators ───────────────────────────────────────────────────
const validateUpdateUser = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Provide a valid email address')
    .normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'user']).withMessage('Role must be admin, manager, or user'),
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
  handleValidationErrors,
];

// ─── Param ID Validator ───────────────────────────────────────────────────────
const validateMongoId = [
  param('id')
    .isMongoId().withMessage('Invalid user ID format'),
  handleValidationErrors,
];

// ─── Query Validators ─────────────────────────────────────────────────────────
const validateUserListQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1–100'),
  query('role').optional().isIn(['admin', 'manager', 'user']).withMessage('Invalid role filter'),
  query('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  handleValidationErrors,
];

module.exports = {
  validateLogin,
  validateCreateUser,
  validateUpdateUser,
  validateMongoId,
  validateUserListQuery,
};
