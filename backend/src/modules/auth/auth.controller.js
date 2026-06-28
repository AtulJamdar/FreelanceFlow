const authService = require('./auth.service');
const { sendSuccess } = require('../../utils/apiResponse');

/**
 * Register a new freelancer account
 */
const register = async (req, res) => {
  const result = await authService.registerUser(req.body);
  return sendSuccess(res, result, 201);
};

/**
 * Log in a freelancer
 */
const login = async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.loginUser(email, password);
  return sendSuccess(res, result, 200);
};

/**
 * Get currently authenticated freelancer profile
 */
const getMe = async (req, res) => {
  // req.user is already loaded and populated by protect middleware
  return sendSuccess(res, req.user, 200);
};

/**
 * Update currently authenticated freelancer profile details
 */
const updateMe = async (req, res) => {
  const result = await authService.updateProfile(req.user._id, req.body);
  return sendSuccess(res, result, 200);
};

module.exports = {
  register,
  login,
  getMe,
  updateMe
};
