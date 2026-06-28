const { sendError } = require('../utils/apiResponse');

/**
 * Factory middleware to verify the current authenticated user owns the resource
 * @param {mongoose.Model} Model - Mongoose model to query
 * @returns {Function} Express middleware handler
 */
const checkOwnership = (Model) => {
  return async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!id) {
        return sendError(res, 'BAD_REQUEST', 'Resource ID parameter is missing', null, 400);
      }

      // Query document
      const doc = await Model.findById(id);

      // If document does not exist, return 404
      if (!doc) {
        return sendError(
          res,
          'NOT_FOUND',
          `${Model.modelName || 'Resource'} not found`,
          null,
          404
        );
      }

      // Check if freelancerId matches req.user._id
      const ownerId = doc.freelancerId ? doc.freelancerId.toString() : null;
      const currentUserId = req.user._id ? req.user._id.toString() : null;

      if (!ownerId || ownerId !== currentUserId) {
        return sendError(
          res,
          'FORBIDDEN',
          'You do not have permission to access this resource',
          null,
          403
        );
      }

      // Attach resource to request object to avoid duplicate DB fetches in controller
      req.resource = doc;
      next();
    } catch (error) {
      // Pass casting errors or unexpected exceptions to global error handler
      next(error);
    }
  };
};

module.exports = checkOwnership;
