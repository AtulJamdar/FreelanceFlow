const { body } = require('express-validator');

const createProjectValidators = [
  body('clientId')
    .trim()
    .notEmpty().withMessage('Client ID is required')
    .isMongoId().withMessage('Invalid Client ID format'),
  body('title')
    .trim()
    .notEmpty().withMessage('Project title is required'),
  body('description')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(['not_started', 'in_progress', 'on_hold', 'completed'])
    .withMessage('Invalid status value'),
  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Start date must be a valid ISO8601 date'),
  body('deadline')
    .optional()
    .isISO8601().withMessage('Deadline must be a valid ISO8601 date')
    .custom((value, { req }) => {
      if (req.body.startDate && new Date(value) < new Date(req.body.startDate)) {
        throw new Error('Deadline must be on or after the start date');
      }
      return true;
    }),
  body('totalBudget')
    .optional()
    .isFloat({ min: 0 }).withMessage('Total budget must be a non-negative number'),
  body('currency')
    .optional()
    .trim()
    .notEmpty().withMessage('Currency cannot be empty')
];

const updateProjectValidators = [
  body('clientId')
    .optional()
    .trim()
    .isMongoId().withMessage('Invalid Client ID format'),
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Project title cannot be empty'),
  body('description')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(['not_started', 'in_progress', 'on_hold', 'completed'])
    .withMessage('Invalid status value'),
  body('startDate')
    .optional()
    .isISO8601().withMessage('Start date must be a valid ISO8601 date'),
  body('deadline')
    .optional()
    .isISO8601().withMessage('Deadline must be a valid ISO8601 date')
    .custom((value, { req }) => {
      // Validate only if both are updated in the same request.
      // Date verification incorporating DB state is done in the service layer.
      if (req.body.startDate && new Date(value) < new Date(req.body.startDate)) {
        throw new Error('Deadline must be on or after the start date');
      }
      return true;
    }),
  body('totalBudget')
    .optional()
    .isFloat({ min: 0 }).withMessage('Total budget must be a non-negative number'),
  body('currency')
    .optional()
    .trim()
    .notEmpty().withMessage('Currency cannot be empty')
];

module.exports = {
  createProjectValidators,
  updateProjectValidators
};
