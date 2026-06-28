const { body } = require('express-validator');

const createInvoiceValidators = [
  body('projectId')
    .trim()
    .notEmpty().withMessage('Project ID is required')
    .isMongoId().withMessage('Invalid Project ID format'),
  body('dueDate')
    .notEmpty().withMessage('Due date is required')
    .isISO8601().withMessage('Due date must be a valid ISO8601 date')
    .custom(value => {
      if (new Date(value) <= new Date()) {
        throw new Error('Due date must be in the future');
      }
      return true;
    }),
  body('autoPopulate')
    .optional()
    .isBoolean().withMessage('autoPopulate must be a boolean'),
  body('lineItems')
    .optional()
    .isArray().withMessage('lineItems must be an array')
    .custom((value, { req }) => {
      // If autoPopulate is false/missing, lineItems is required and must not be empty
      const isAutoPopulate = req.body.autoPopulate === true || req.body.autoPopulate === 'true';
      if (!isAutoPopulate) {
        if (!Array.isArray(value) || value.length === 0) {
          throw new Error('Line items are required when autoPopulate is not enabled');
        }
        for (const item of value) {
          if (!item.description || typeof item.description !== 'string' || item.description.trim() === '') {
            throw new Error('Each line item must have a valid description');
          }
          if (item.quantity !== undefined && (typeof item.quantity !== 'number' || item.quantity <= 0)) {
            throw new Error('Line item quantity must be greater than 0');
          }
          if (item.unitPrice === undefined || typeof item.unitPrice !== 'number' || item.unitPrice < 0) {
            throw new Error('Line item unit price must be a non-negative number');
          }
        }
      }
      return true;
    }),
  body('taxRate')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Tax rate must be a percentage between 0 and 100')
];

const updateInvoiceValidators = [
  body('dueDate')
    .optional()
    .isISO8601().withMessage('Due date must be a valid ISO8601 date')
    .custom(value => {
      if (new Date(value) <= new Date()) {
        throw new Error('Due date must be in the future');
      }
      return true;
    }),
  body('lineItems')
    .optional()
    .isArray().withMessage('lineItems must be an array')
    .custom(value => {
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error('Line items array cannot be empty');
      }
      for (const item of value) {
        if (!item.description || typeof item.description !== 'string' || item.description.trim() === '') {
          throw new Error('Each line item must have a valid description');
        }
        if (item.quantity !== undefined && (typeof item.quantity !== 'number' || item.quantity <= 0)) {
          throw new Error('Line item quantity must be greater than 0');
        }
        if (item.unitPrice === undefined || typeof item.unitPrice !== 'number' || item.unitPrice < 0) {
          throw new Error('Line item unit price must be a non-negative number');
        }
      }
      return true;
    }),
  body('taxRate')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Tax rate must be a percentage between 0 and 100')
];

module.exports = {
  createInvoiceValidators,
  updateInvoiceValidators
};
