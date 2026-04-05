const { body, param, query } = require('express-validator');

const createRecordValidator = [
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0.01 }).withMessage('Amount must be a number greater than 0'),

  body('type')
    .notEmpty().withMessage('Type is required')
    .isIn(['income', 'expense']).withMessage('Type must be income or expense'),

  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isLength({ max: 50 }).withMessage('Category cannot exceed 50 characters'),

  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Date must be a valid ISO 8601 date e.g. 2024-01-25'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
];

const updateRecordValidator = [
  param('id')
    .isMongoId().withMessage('Invalid record ID'),

  body('amount')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('Amount must be a number greater than 0'),

  body('type')
    .optional()
    .isIn(['income', 'expense']).withMessage('Type must be income or expense'),

  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Category cannot exceed 50 characters'),

  body('date')
    .optional()
    .isISO8601().withMessage('Date must be a valid ISO 8601 date e.g. 2024-01-25'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
];

const recordIdValidator = [
  param('id')
    .isMongoId().withMessage('Invalid record ID'),
];

const getRecordsValidator = [
  query('type')
    .optional()
    .isIn(['income', 'expense']).withMessage('Type must be income or expense'),

  query('category')
    .optional()
    .trim(),

  query('from')
    .optional()
    .isISO8601().withMessage('From date must be a valid ISO 8601 date'),

  query('to')
    .optional()
    .isISO8601().withMessage('To date must be a valid ISO 8601 date'),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

module.exports = {
  createRecordValidator,
  updateRecordValidator,
  recordIdValidator,
  getRecordsValidator,
};