const express = require('express');

const invoiceController = require('./invoice.controller');
const Invoice = require('./invoice.model');
const { createInvoiceValidators, updateInvoiceValidators } = require('./invoice.validator');
const validate = require('../../middleware/validate');
const { protect } = require('../../middleware/auth');
const checkOwnership = require('../../middleware/checkOwnership');
const asyncHandler = require('../../middleware/asyncHandler');
const paymentController = require('../payments/payment.controller');
const { createPaymentValidators } = require('../payments/payment.validator');

const router = express.Router();

// Apply auth protection globally
router.use(protect);

// CRUD invoice routes
router.post('/', createInvoiceValidators, validate, asyncHandler(invoiceController.createInvoice));
router.get('/', asyncHandler(invoiceController.getInvoices));

// Single invoice operations guarded by checkOwnership
router.get('/:id', checkOwnership(Invoice), asyncHandler(invoiceController.getInvoice));
router.put('/:id', checkOwnership(Invoice), updateInvoiceValidators, validate, asyncHandler(invoiceController.updateInvoice));

// Manual status update
router.patch('/:id/status', checkOwnership(Invoice), asyncHandler(invoiceController.updateStatus));

// PDF download & Email send
router.get('/:id/pdf', checkOwnership(Invoice), asyncHandler(invoiceController.downloadPDF));
router.post('/:id/send', checkOwnership(Invoice), asyncHandler(invoiceController.sendInvoice));

// Nested payment routes under invoices
router.post('/:id/payments', checkOwnership(Invoice), createPaymentValidators, validate, asyncHandler(paymentController.recordPayment));
router.get('/:id/payments', checkOwnership(Invoice), asyncHandler(paymentController.getPayments));

module.exports = router;
