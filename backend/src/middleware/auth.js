const jwt = require('jsonwebtoken');
const User = require('../modules/auth/user.model');
const config = require('../config/env');

/**
 * Middleware to protect routes and verify JWT authentication
 */
const protect = async (req, res, next) => {
  let token;

  try {
    // Check for authorization header and confirm Bearer prefix
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, config.jwtSecret);

      // Get user from the token, excluding passwordHash
      const user = await User.findById(decoded.userId).select('-passwordHash');

      if (!user) {
        const error = new Error('Not authorized, user not found');
        error.statusCode = 401;
        error.code = 'UNAUTHORIZED';
        return next(error);
      }

      // Attach user to request object
      req.user = user;
      return next();
    }

    if (!token) {
      const error = new Error('Not authorized, no token provided');
      error.statusCode = 401;
      error.code = 'UNAUTHORIZED';
      return next(error);
    }
  } catch (error) {
    // Forward JWT verification errors (e.g. JsonWebTokenError, TokenExpiredError) to the errorHandler
    error.statusCode = 401;
    if (!error.code) {
      error.code = error.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'UNAUTHORIZED';
    }
    return next(error);
  }
};

module.exports = {
  protect
};
