const { sendError } = require('../utils/apiResponse');

/**
 * Global Express error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log the error for development debugging
  console.error(err);

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    // Extract the first validation error field and message
    const firstErrorKey = Object.keys(err.errors)[0];
    const firstError = err.errors[firstErrorKey];
    return sendError(
      res,
      'VALIDATION_ERROR',
      firstError.message,
      firstError.path,
      400
    );
  }

  // Mongoose duplicate key error (MongoDB error code 11000)
  if (err.code === 11000) {
    const duplicateField = Object.keys(err.keyValue || {})[0] || 'unknown';
    return sendError(
      res,
      'CONFLICT',
      `Duplicate value entered for field: ${duplicateField}`,
      duplicateField,
      409
    );
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return sendError(
      res,
      'INVALID_ID',
      `Invalid ${err.kind || 'ID'} format for path: ${err.path}`,
      err.path,
      400
    );
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'UNAUTHORIZED', 'Invalid authentication token', null, 401);
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'TOKEN_EXPIRED', 'Authentication token has expired', null, 401);
  }

  // Standard application custom errors (if they provide status and code)
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  const errorMessage = err.message || 'An unexpected error occurred on the server';

  return sendError(res, errorCode, errorMessage, err.field || null, statusCode);
};

module.exports = errorHandler;
