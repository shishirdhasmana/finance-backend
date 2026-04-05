const { body, param } = require('express-validator');
const { ROLES } = require('../config/roles');

const createUserValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),

  body('role')
    .optional()
    .isIn(Object.values(ROLES)).withMessage('Invalid role'),

  body('status')
    .optional()
    .isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
];

const updateUserValidator = [
  param('id')
    .isMongoId().withMessage('Invalid user ID'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),

  body('role')
    .optional()
    .isIn(Object.values(ROLES)).withMessage('Invalid role'),

  body('status')
    .optional()
    .isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),

  body('email')
    .not().exists().withMessage('Email cannot be updated'),

  body('password')
    .not().exists().withMessage('Use the change password endpoint instead'),
];

const userIdValidator = [
  param('id')
    .isMongoId().withMessage('Invalid user ID'),
];

module.exports = { createUserValidator, updateUserValidator, userIdValidator };