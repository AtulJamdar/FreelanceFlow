const invoiceService = require('./invoice.service');
const Invoice = require('./invoice.model');
const { generateInvoicePDF } = require('./invoice.pdf');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

/**
 * Create a new invoice (draft status)
 */
const createInvoice = async (req, res) => {
  const result = await invoiceService.createInvoice(req.user._id, req.body);
  return sendSuccess(res, result, 201);
};

/**
 * Retrieve all invoices (paginated and filterable)
 */
const getInvoices = async (req, res) => {
  const result = await invoiceService.getAllInvoices(req.user._id, req.query);
  return sendSuccess(res, result, 200);
};

/**
 * Retrieve specific invoice details decorated with payments
 */
const getInvoice = async (req, res) => {
  const result = await invoiceService.getInvoiceById(req.user._id, req.params.id);
  return sendSuccess(res, result, 200);
};

/**
 * Update draft invoice details
 */
const updateInvoice = async (req, res) => {
  const result = await invoiceService.updateInvoice(req.user._id, req.params.id, req.body);
  return sendSuccess(res, result, 200);
};

/**
 * Update invoice status manually
 */
const updateStatus = async (req, res) => {
  const result = await invoiceService.updateInvoiceStatus(req.user._id, req.params.id, req.body.status);
  return sendSuccess(res, result, 200);
};

/**
 * Download Invoice as PDF document
 */
const downloadPDF = async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, freelancerId: req.user._id }).populate('clientId');
  if (!invoice) {
    return sendError(res, 'NOT_FOUND', 'Invoice not found', null, 404);
  }

  // Generate PDF buffer
  const pdfBuffer = await generateInvoicePDF(invoice, req.user, invoice.clientId);

  // Set response headers to force download of the PDF file
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${invoice.invoiceNumber}.pdf`);
  
  return res.send(pdfBuffer);
};

/**
 * Send Invoice via Email with PDF attachment
 */
const sendInvoice = async (req, res) => {
  const result = await invoiceService.sendInvoiceEmail(req.user._id, req.params.id);
  return sendSuccess(res, {
    message: 'Invoice emailed successfully',
    invoice: {
      _id: result._id,
      invoiceNumber: result.invoiceNumber,
      status: result.status,
      sentAt: result.sentAt
    }
  }, 200);
};

module.exports = {
  createInvoice,
  getInvoices,
  getInvoice,
  updateInvoice,
  updateStatus,
  downloadPDF,
  sendInvoice
};
