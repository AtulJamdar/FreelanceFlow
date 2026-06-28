const express = require('express');

const dashboardController = require('./dashboard.controller');
const { protect } = require('../../middleware/auth');
const asyncHandler = require('../../middleware/asyncHandler');

const router = express.Router();

// Apply auth protection globally
router.use(protect);

// Retrieve dashboard aggregates
router.get('/', asyncHandler(dashboardController.getDashboard));

module.exports = router;
