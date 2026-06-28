const { body } = require('express-validator');

const createPaymentValidators = [
  body('amount')
    .notEmpty().withMessage('Payment amount is required')
    .isFloat({ gt: 0 }).withMessage('Payment amount must be greater than zero'),
  body('method')
    .trim()
    .notEmpty().withMessage('Payment method is required')
    .isIn(['bank_transfer', 'upi', 'cash', 'paypal', 'other'])
    .withMessage('Invalid payment method value'),
  body('paymentDate')
    .notEmpty().withMessage('Payment date is required')
    .isISO8601().withMessage('Payment date must be a valid ISO8601 date')
    .custom(value => {
      // Allow slight clock drifts by checking against slightly in the future (e.g. + 1 minute)
      const inputDate = new Date(value);
      const futureLimit = new Date(Date.now() + 60000);
      if (inputDate > futureLimit) {
        throw new Error('Payment date cannot be in the future');
      }
      return true;
    }),
  body('referenceNumber')
    .optional()
    .trim()
];

module.exports = {
  createPaymentValidators
};
