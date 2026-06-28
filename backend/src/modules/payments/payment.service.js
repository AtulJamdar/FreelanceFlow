const Payment = require('./payment.model');
const Invoice = require('../invoices/invoice.model');

/**
 * Record a payment against an invoice
 */
const recordPayment = async (freelancerId, invoiceId, paymentData) => {
  const { amount, paymentDate, method, referenceNumber } = paymentData;

  const invoice = await Invoice.findOne({ _id: invoiceId, freelancerId });
  if (!invoice) {
    const error = new Error('Invoice not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  // Guard: Block payments if the invoice is already paid
  if (invoice.status === 'paid') {
    const error = new Error('Invoice is already paid');
    error.statusCode = 400;
    error.code = 'BAD_REQUEST';
    throw error;
  }

  // Guard: Avoid overpayment (accounting for JS floating point limits)
  const remaining = Math.round((invoice.totalAmount - invoice.amountPaid) * 100) / 100;
  if (amount > remaining) {
    const error = new Error(`Payment amount exceeds the outstanding invoice balance of ${remaining}`);
    error.statusCode = 400;
    error.code = 'BAD_REQUEST';
    throw error;
  }

  // Create payment record
  const payment = new Payment({
    freelancerId,
    invoiceId,
    amount,
    paymentDate: paymentDate || new Date(),
    method,
    referenceNumber
  });
  await payment.save();

  // Update invoice running total and status
  invoice.amountPaid = Math.round((invoice.amountPaid + amount) * 100) / 100;
  if (invoice.amountPaid >= invoice.totalAmount) {
    invoice.status = 'paid';
    invoice.paidAt = new Date();
  } else {
    invoice.status = 'partially_paid';
  }
  await invoice.save();

  return payment;
};

/**
 * Retrieve payments recorded for an invoice
 */
const getPaymentsForInvoice = async (freelancerId, invoiceId) => {
  // Check if invoice exists to prevent empty arrays on wrong IDs
  const invoiceExists = await Invoice.exists({ _id: invoiceId, freelancerId });
  if (!invoiceExists) {
    const error = new Error('Invoice not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  return Payment.find({ invoiceId, freelancerId }).sort({ paymentDate: -1 });
};

/**
 * Retrieve a specific payment profile details
 */
const getPaymentById = async (freelancerId, paymentId) => {
  const payment = await Payment.findOne({ _id: paymentId, freelancerId });
  if (!payment) {
    const error = new Error('Payment record not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }
  return payment;
};

/**
 * Delete a payment record and reverse its impact on the invoice totals
 */
const deletePayment = async (freelancerId, paymentId) => {
  const payment = await Payment.findOne({ _id: paymentId, freelancerId });
  if (!payment) {
    const error = new Error('Payment record not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  const invoice = await Invoice.findOne({ _id: payment.invoiceId, freelancerId });
  if (invoice) {
    // Reverse totals (preventing negative values)
    invoice.amountPaid = Math.max(0, Math.round((invoice.amountPaid - payment.amount) * 100) / 100);
    
    // Restore status based on outstanding payments and dispatch state
    if (invoice.amountPaid === 0) {
      invoice.status = invoice.sentAt ? 'sent' : 'draft';
      invoice.paidAt = null;
    } else {
      invoice.status = 'partially_paid';
      invoice.paidAt = null;
    }
    await invoice.save();
  }

  await Payment.deleteOne({ _id: paymentId, freelancerId });
  return { id: paymentId };
};

module.exports = {
  recordPayment,
  getPaymentsForInvoice,
  getPaymentById,
  deletePayment
};
