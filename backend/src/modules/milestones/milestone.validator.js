const { body } = require('express-validator');

const createMilestoneValidators = [
  body('title')
    .trim()
    .notEmpty().withMessage('Milestone title is required'),
  body('description')
    .optional()
    .trim(),
  body('amount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Milestone amount must be a non-negative number'),
  body('dueDate')
    .optional()
    .isISO8601().withMessage('Due date must be a valid ISO8601 date')
];

const updateMilestoneValidators = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Milestone title cannot be empty'),
  body('description')
    .optional()
    .trim(),
  body('amount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Milestone amount must be a non-negative number'),
  body('dueDate')
    .optional()
    .isISO8601().withMessage('Due date must be a valid ISO8601 date')
];

module.exports = {
  createMilestoneValidators,
  updateMilestoneValidators
};
