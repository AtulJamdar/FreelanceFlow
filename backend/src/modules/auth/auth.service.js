const jwt = require('jsonwebtoken');
const User = require('./user.model');
const config = require('../../config/env');

/**
 * Signs a JWT token containing the userId and email
 * @param {string} userId - User ObjectId
 * @param {string} email - User email address
 * @returns {string} Signed JWT token
 */
const generateToken = (userId, email) => {
  return jwt.sign(
    { userId, email },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

/**
 * Register a new freelancer account
 */
const registerUser = async (userData) => {
  const { name, email, password, businessName, phone, address } = userData;

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('Email is already registered');
    error.statusCode = 409;
    error.code = 'CONFLICT';
    error.field = 'email';
    throw error;
  }

  // Create new User instance (password virtual will trigger pre-save hashing)
  const user = new User({
    name,
    email,
    password,
    businessName,
    phone,
    address
  });

  await user.save();

  // Generate JWT token
  const token = generateToken(user._id, user.email);

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    businessName: user.businessName,
    token
  };
};

/**
 * Authenticate a freelancer and return JWT
 */
const loginUser = async (email, password) => {
  // Explicitly select passwordHash since it's hidden by default schema settings
  const user = await User.findOne({ email }).select('+passwordHash');
  
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    error.code = 'UNAUTHORIZED';
    throw error;
  }

  // Compare candidate password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    error.code = 'UNAUTHORIZED';
    throw error;
  }

  // Generate JWT token
  const token = generateToken(user._id, user.email);

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    token
  };
};

/**
 * Update freelancer profile details
 */
const updateProfile = async (userId, updateData) => {
  // Strip immutable / security fields to prevent unauthorized elevation
  const filteredData = { ...updateData };
  const disallowedFields = ['_id', 'email', 'passwordHash', 'createdAt', 'updatedAt'];
  
  disallowedFields.forEach(field => delete filteredData[field]);

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: filteredData },
    { new: true, runValidators: true }
  ).select('-passwordHash');

  if (!updatedUser) {
    const error = new Error('User profile not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  return updatedUser;
};

module.exports = {
  registerUser,
  loginUser,
  updateProfile
};
