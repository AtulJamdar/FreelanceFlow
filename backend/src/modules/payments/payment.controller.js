const paymentService = require('./payment.service');
const { sendSuccess } = require('../../utils/apiResponse');

/**
 * Record a payment against an invoice
 */
const recordPayment = async (req, res) => {
  const invoiceId = req.params.invoiceId || req.params.id;
  const result = await paymentService.recordPayment(req.user._id, invoiceId, req.body);
  return sendSuccess(res, result, 201);
};

/**
 * Retrieve all payments recorded for a specific invoice
 */
const getPayments = async (req, res) => {
  const invoiceId = req.params.invoiceId || req.params.id;
  const result = await paymentService.getPaymentsForInvoice(req.user._id, invoiceId);
  return sendSuccess(res, result, 200);
};

/**
 * Retrieve specific payment profile details
 */
const getPayment = async (req, res) => {
  const result = await paymentService.getPaymentById(req.user._id, req.params.id);
  return sendSuccess(res, result, 200);
};

/**
 * Delete a payment record and reverse its totals impact
 */
const deletePayment = async (req, res) => {
  const result = await paymentService.deletePayment(req.user._id, req.params.id);
  return sendSuccess(res, { message: 'Payment record deleted and invoice reversed successfully', payment: result }, 200);
};

module.exports = {
  recordPayment,
  getPayments,
  getPayment,
  deletePayment
};
