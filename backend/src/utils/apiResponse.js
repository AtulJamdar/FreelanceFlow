/**
 * Sends a standardized success API response
 * @param {Object} res - Express response object
 * @param {any} data - Payload to send in the success response
 * @param {number} [statusCode=200] - HTTP status code
 */
const sendSuccess = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data
  });
};

/**
 * Sends a standardized error API response
 * @param {Object} res - Express response object
 * @param {string} code - Error code identifier (e.g. VALIDATION_ERROR)
 * @param {string} message - Human-readable explanation of error
 * @param {string|null} [field=null] - Optional field that caused validation error
 * @param {number} [statusCode=400] - HTTP status code
 */
const sendError = (res, code, message, field = null, statusCode = 400) => {
  const errorObj = {
    code,
    message
  };

  if (field !== null) {
    errorObj.field = field;
  }

  return res.status(statusCode).json({
    success: false,
    error: errorObj
  });
};

module.exports = {
  sendSuccess,
  sendError
};
