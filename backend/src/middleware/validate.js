const { validationResult } = require('express-validator');
const { sendError } = require('../utils/apiResponse');

/**
 * Middleware that checks validation results and returns standard 400 errors if present
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Extract the first validation error
    const firstError = errors.array()[0];
    return sendError(
      res,
      'VALIDATION_ERROR',
      firstError.msg,
      firstError.path || firstError.param, // express-validator v7 uses 'path', v6 used 'param'
      400
    );
  }
  next();
};

module.exports = validate;
