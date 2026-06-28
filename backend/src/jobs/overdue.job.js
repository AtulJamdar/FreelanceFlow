const cron = require('node-cron');
const Invoice = require('../modules/invoices/invoice.model');
const User = require('../modules/auth/user.model');
const { sendEmail, buildOverdueEmail } = require('../utils/email');

/**
 * Scan database for overdue invoices, mark them, and dispatch reminder emails.
 * @returns {Promise<Array>} Array of updated invoice documents
 */
const checkOverdueInvoices = async () => {
  console.log('[Cron Job] Executing overdue checker...');
  
  const now = new Date();

  // Query: Invoices past due date, currently sent or partially paid, not archived
  const overdueInvoices = await Invoice.find({
    dueDate: { $lt: now },
    status: { $in: ['sent', 'partially_paid'] },
    isArchived: false
  }).populate('clientId').populate('projectId');

  console.log(`[Cron Job] Found ${overdueInvoices.length} invoices transitioning to overdue.`);

  if (overdueInvoices.length === 0) {
    return [];
  }

  const results = [];

  for (const invoice of overdueInvoices) {
    try {
      // 1. Mark as overdue
      invoice.status = 'overdue';
      await invoice.save();

      // 2. Load freelancer profile
      const freelancer = await User.findById(invoice.freelancerId);
      if (!freelancer) {
        console.error(`[Cron Job] Freelancer not found for invoice ${invoice.invoiceNumber}`);
        continue;
      }

      const client = invoice.clientId;

      // 3. Compile overdue HTML message body
      const emailHtml = buildOverdueEmail(invoice, freelancer, client);

      // 4. Queue the email promise (don't block loop execution)
      const emailPromise = sendEmail({
        to: client.email,
        subject: `[Overdue Notice] Payment Reminder: Invoice ${invoice.invoiceNumber}`,
        html: emailHtml
      });

      results.push({
        invoiceNumber: invoice.invoiceNumber,
        promise: emailPromise
      });
    } catch (error) {
      console.error(`[Cron Job] Failed to process invoice ${invoice.invoiceNumber}:`, error.message);
    }
  }

  // 5. Concurrently dispatch email requests. If one SMTP connection fails, the others must proceed.
  const promises = results.map(r => r.promise);
  const outcomes = await Promise.allSettled(promises);

  outcomes.forEach((outcome, index) => {
    const invoiceNum = results[index].invoiceNumber;
    if (outcome.status === 'rejected') {
      console.error(`[Cron Job] SMTP delivery failed for invoice ${invoiceNum}:`, outcome.reason.message);
    } else {
      console.log(`[Cron Job] Overdue reminder successfully emailed for invoice ${invoiceNum}`);
    }
  });

  return overdueInvoices;
};

/**
 * Initialize node-cron schedule (Runs at 00:05 daily)
 */
const startOverdueChecker = () => {
  cron.schedule('5 0 * * *', async () => {
    try {
      await checkOverdueInvoices();
    } catch (error) {
      console.error('[Cron Job Fatal Error]:', error.message);
    }
  });
  console.log('[Cron Job] Overdue Checker successfully registered.');
};

module.exports = {
  checkOverdueInvoices,
  startOverdueChecker
};
