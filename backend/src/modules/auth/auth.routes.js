const express = require('express');
const rateLimit = require('express-rate-limit');

const authController = require('./auth.controller');
const { registerValidators, loginValidators } = require('./auth.validator');
const validate = require('../../middleware/validate');
const { protect } = require('../../middleware/auth');
const asyncHandler = require('../../middleware/asyncHandler');

const router = express.Router();

// T-014: Rate limiting specifically for authentication routes to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 authentication requests per window
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts from this IP, please try again after 15 minutes'
    }
  },
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false
});

// Authentication endpoints
router.post('/register', authLimiter, registerValidators, validate, asyncHandler(authController.register));
router.post('/login', authLimiter, loginValidators, validate, asyncHandler(authController.login));

// Protected profile endpoints
router.get('/me', protect, asyncHandler(authController.getMe));
router.put('/me', protect, asyncHandler(authController.updateMe));

module.exports = router;
