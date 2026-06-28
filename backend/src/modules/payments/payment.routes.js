const express = require('express');

const paymentController = require('./payment.controller');
const Payment = require('./payment.model');
const { protect } = require('../../middleware/auth');
const checkOwnership = require('../../middleware/checkOwnership');
const asyncHandler = require('../../middleware/asyncHandler');

const router = express.Router();

// Apply auth protection globally
router.use(protect);

// Standalone payment endpoints
router.get('/payments/:id', checkOwnership(Payment), asyncHandler(paymentController.getPayment));
router.delete('/payments/:id', checkOwnership(Payment), asyncHandler(paymentController.deletePayment));

module.exports = router;
