const { body } = require('express-validator');

const createClientValidators = [
  body('name')
    .trim()
    .notEmpty().withMessage('Client name is required'),
  body('email')
    .trim()
    .notEmpty().withMessage('Client email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('phone')
    .optional()
    .trim(),
  body('company')
    .optional()
    .trim(),
  body('address')
    .optional()
    .trim(),
  body('notes')
    .optional()
    .trim()
];

const updateClientValidators = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Client name cannot be empty'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('phone')
    .optional()
    .trim(),
  body('company')
    .optional()
    .trim(),
  body('address')
    .optional()
    .trim(),
  body('notes')
    .optional()
    .trim()
];

module.exports = {
  createClientValidators,
  updateClientValidators
};
