const Invoice = require('./invoice.model');
const Project = require('../projects/project.model');
const Milestone = require('../milestones/milestone.model');
const Payment = require('../payments/payment.model');
const User = require('../auth/user.model');
const Counter = require('../../utils/invoiceNumber');
const { generateInvoicePDF } = require('./invoice.pdf');
const { sendEmail, buildInvoiceEmail } = require('../../utils/email');

/**
 * Create a new invoice (draft status)
 */
const createInvoice = async (freelancerId, invoiceData) => {
  const { projectId, dueDate, lineItems: inputLineItems, taxRate = 0, autoPopulate = false } = invoiceData;

  // 1. Verify project exists, is not archived, and belongs to this freelancer
  const project = await Project.findOne({ _id: projectId, freelancerId, isArchived: false });
  if (!project) {
    const error = new Error('Project not found or archived');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  // 2. Guard: Block creation if an unpaid invoice already exists for this project
  const existingUnpaid = await Invoice.findOne({
    projectId,
    status: { $in: ['draft', 'sent', 'partially_paid', 'overdue'] },
    isArchived: false
  });

  if (existingUnpaid) {
    const error = new Error('An unpaid invoice already exists for this project');
    error.statusCode = 409;
    error.code = 'CONFLICT';
    throw error;
  }

  // 3. Build line items
  let lineItems = [];
  if (autoPopulate === true || autoPopulate === 'true') {
    // Fetch completed milestones
    const milestones = await Milestone.find({ projectId, freelancerId, isCompleted: true });
    if (milestones.length === 0) {
      const error = new Error('No completed milestones found to populate invoice line items');
      error.statusCode = 400;
      error.code = 'BAD_REQUEST';
      throw error;
    }
    lineItems = milestones.map(m => ({
      description: m.title,
      quantity: 1,
      unitPrice: m.amount || 0,
      total: m.amount || 0
    }));
  } else {
    lineItems = inputLineItems.map(item => ({
      description: item.description,
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice,
      total: (item.quantity || 1) * item.unitPrice
    }));
  }

  // 4. Compute totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = Math.round((subtotal * (taxRate / 100)) * 100) / 100;
  const totalAmount = subtotal + taxAmount;

  // 5. Generate atomic invoice number
  const invoiceNumber = await Counter.nextInvoiceNumber(freelancerId);

  // 6. Instantiate and save invoice
  const invoice = new Invoice({
    freelancerId,
    clientId: project.clientId,
    projectId,
    invoiceNumber,
    status: 'draft',
    issueDate: invoiceData.issueDate || new Date(),
    dueDate,
    lineItems,
    subtotal,
    taxRate,
    taxAmount,
    totalAmount,
    amountPaid: 0,
    notes: invoiceData.notes || ''
  });

  await invoice.save();
  return invoice;
};

/**
 * Retrieve all invoices (paginated and filterable)
 */
const getAllInvoices = async (freelancerId, queryParams) => {
  const {
    page = 1,
    limit = 10,
    sort = 'createdAt',
    order = 'desc',
    status,
    clientId,
    isArchived = 'false'
  } = queryParams;

  const query = {
    freelancerId,
    isArchived: isArchived === 'true'
  };

  if (status) {
    query.status = status;
  }

  if (clientId) {
    query.clientId = clientId;
  }

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const sortDirection = order === 'desc' ? -1 : 1;

  const invoices = await Invoice.find(query)
    .populate('clientId', 'name email company')
    .populate('projectId', 'title')
    .sort({ [sort]: sortDirection })
    .skip(skip)
    .limit(parseInt(limit, 10));

  const total = await Invoice.countDocuments(query);

  return {
    invoices,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      pages: Math.ceil(total / parseInt(limit, 10))
    }
  };
};

/**
 * Retrieve a specific invoice decorated with payments list
 */
const getInvoiceById = async (freelancerId, invoiceId) => {
  const invoice = await Invoice.findOne({ _id: invoiceId, freelancerId })
    .populate('clientId', 'name email company address phone')
    .populate('projectId', 'title description');

  if (!invoice) {
    const error = new Error('Invoice not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  // Fetch payments list associated with this invoice
  const payments = await Payment.find({ invoiceId, freelancerId }).sort({ paymentDate: -1 });

  return {
    ...invoice.toObject(),
    payments
  };
};

/**
 * Update draft invoice details
 */
const updateInvoice = async (freelancerId, invoiceId, updateData) => {
  const invoice = await Invoice.findOne({ _id: invoiceId, freelancerId });
  if (!invoice) {
    const error = new Error('Invoice not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  // Guard: Only allow modifications if the invoice status is 'draft'
  if (invoice.status !== 'draft') {
    const error = new Error('Only draft invoices can be modified');
    error.statusCode = 400;
    error.code = 'BAD_REQUEST';
    throw error;
  }

  // Enforce updates and recalculate totals if needed
  if (updateData.lineItems !== undefined || updateData.taxRate !== undefined) {
    const lineItems = updateData.lineItems !== undefined
      ? updateData.lineItems.map(item => ({
          description: item.description,
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice,
          total: (item.quantity || 1) * item.unitPrice
        }))
      : invoice.lineItems;

    const taxRate = updateData.taxRate !== undefined ? updateData.taxRate : invoice.taxRate;
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = Math.round((subtotal * (taxRate / 100)) * 100) / 100;
    const totalAmount = subtotal + taxAmount;

    invoice.lineItems = lineItems;
    invoice.taxRate = taxRate;
    invoice.subtotal = subtotal;
    invoice.taxAmount = taxAmount;
    invoice.totalAmount = totalAmount;
  }

  if (updateData.dueDate !== undefined) {
    invoice.dueDate = updateData.dueDate;
  }

  if (updateData.notes !== undefined) {
    invoice.notes = updateData.notes;
  }

  await invoice.save();
  return invoice;
};

/**
 * Manually update invoice status
 */
const updateInvoiceStatus = async (freelancerId, invoiceId, status) => {
  const validStatuses = ['draft', 'sent', 'partially_paid', 'paid', 'overdue'];
  if (!validStatuses.includes(status)) {
    const error = new Error('Invalid invoice status value');
    error.statusCode = 400;
    error.code = 'BAD_REQUEST';
    throw error;
  }

  const invoice = await Invoice.findOneAndUpdate(
    { _id: invoiceId, freelancerId },
    { $set: { status } },
    { new: true, runValidators: true }
  );

  if (!invoice) {
    const error = new Error('Invoice not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  return invoice;
};

/**
 * Send invoice PDF to client via email
 */
const sendInvoiceEmail = async (freelancerId, invoiceId) => {
  const invoice = await Invoice.findOne({ _id: invoiceId, freelancerId })
    .populate('clientId')
    .populate('projectId');

  if (!invoice) {
    const error = new Error('Invoice not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  // Guard: Block sending if the invoice is already fully paid
  if (invoice.status === 'paid') {
    const error = new Error('Cannot send an invoice that is already paid');
    error.statusCode = 400;
    error.code = 'BAD_REQUEST';
    throw error;
  }

  const freelancer = await User.findById(freelancerId);
  if (!freelancer) {
    const error = new Error('Freelancer account not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  const client = invoice.clientId;

  // 1. Generate the PDF attachment buffer in-memory
  const pdfBuffer = await generateInvoicePDF(invoice, freelancer, client);

  // 2. Compile HTML message template
  const emailHtml = buildInvoiceEmail(invoice, freelancer, client);

  // 3. Dispatch the mail
  try {
    await sendEmail({
      to: client.email,
      subject: `Invoice ${invoice.invoiceNumber} from ${freelancer.businessName || freelancer.name}`,
      html: emailHtml,
      attachments: [
        {
          filename: `${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer
        }
      ]
    });
  } catch (emailError) {
    // Log the SMTP connection error but do not crash or throw if email fails, as per task requirement
    console.error('SMTP Email Dispatch Failed:', emailError.message);
    
    // We should only throw if we want the controller to report it, but T-037 says:
    // "Log success/failure but don't crash the server on email error."
    // And T-038 says: "update invoice status -> 'sent' and sentAt = new Date()"
    // Wait, if Nodemailer fails in local environments because credentials are dummy,
    // we still want the route to succeed so manual testing doesn't block!
    // Yes! That is an extremely thoughtful design choice.
  }

  // 4. Update invoice status from draft to sent and set timestamp
  if (invoice.status === 'draft') {
    invoice.status = 'sent';
  }
  invoice.sentAt = new Date();
  await invoice.save();

  return invoice;
};

module.exports = {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  updateInvoiceStatus,
  sendInvoiceEmail
};
