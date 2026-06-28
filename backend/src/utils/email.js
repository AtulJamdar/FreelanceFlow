const nodemailer = require('nodemailer');
const config = require('../config/env');

// Initialize SMTP Transporter
const transporter = nodemailer.createTransport({
  host: config.smtpHost,
  port: config.smtpPort,
  secure: config.smtpPort === 465, // True for 465, false for 587 or 25
  auth: {
    user: config.emailUser,
    pass: config.emailPass
  }
});

/**
 * Sends a transactional email
 * @param {object} options - Mail configuration options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.html - HTML message body
 * @param {array} [options.attachments] - Optional attachments list (e.g. PDF buffers)
 */
const sendEmail = async ({ to, subject, html, attachments }) => {
  const mailOptions = {
    from: `"FreelanceFlow Invoicing" <${config.emailUser}>`,
    to,
    subject,
    html,
    attachments
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

/**
 * Generates HTML template for newly issued invoices
 */
const buildInvoiceEmail = (invoice, freelancer, client) => {
  const formattedAmount = invoice.totalAmount.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR'
  });
  
  const dueDateFormatted = new Date(invoice.dueDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #2d3748; background-color: #f7fafc; margin: 0; padding: 20px; }
        .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 8px; border: 1px solid #e2e8f0; }
        .header { border-bottom: 2px solid #edf2f7; padding-bottom: 20px; margin-bottom: 20px; }
        .title { font-size: 20px; font-weight: bold; color: #1a0dab; }
        .greeting { font-size: 16px; margin-bottom: 15px; }
        .details-box { background: #edf2f7; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .details-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
        .details-row:last-child { margin-bottom: 0; }
        .footer { margin-top: 40px; border-top: 1px solid #edf2f7; padding-top: 20px; font-size: 12px; color: #a0aec0; text-align: center; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <div class="title">New Invoice Issued</div>
        </div>
        <div class="greeting">Dear ${client.name},</div>
        <p>Please find attached the invoice <strong>${invoice.invoiceNumber}</strong> issued by <strong>${freelancer.businessName || freelancer.name}</strong>.</p>
        
        <div class="details-box">
          <div class="details-row">
            <strong>Invoice Number:</strong>
            <span>${invoice.invoiceNumber}</span>
          </div>
          <div class="details-row">
            <strong>Due Date:</strong>
            <span>${dueDateFormatted}</span>
          </div>
          <div class="details-row">
            <strong>Total Amount Due:</strong>
            <span>${formattedAmount}</span>
          </div>
        </div>

        <p>Please review the attached PDF for itemized breakdowns and payment instructions.</p>
        <p>Thank you for your business!</p>

        <div class="footer">
          Sent from <strong>${freelancer.businessName || freelancer.name}</strong> via FreelanceFlow.
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generates HTML template for overdue invoices
 */
const buildOverdueEmail = (invoice, freelancer, client) => {
  const formattedAmount = invoice.totalAmount.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR'
  });
  
  const dueDateFormatted = new Date(invoice.dueDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #2d3748; background-color: #f7fafc; margin: 0; padding: 20px; }
        .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 8px; border: 1px solid #e2e8f0; }
        .header { border-bottom: 2px solid #fed7d7; padding-bottom: 20px; margin-bottom: 20px; }
        .title { font-size: 20px; font-weight: bold; color: #e53e3e; }
        .greeting { font-size: 16px; margin-bottom: 15px; }
        .details-box { background: #fff5f5; border: 1px solid #fed7d7; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .details-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; color: #9b2c2c; }
        .details-row:last-child { margin-bottom: 0; }
        .footer { margin-top: 40px; border-top: 1px solid #edf2f7; padding-top: 20px; font-size: 12px; color: #a0aec0; text-align: center; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <div class="title">Payment Reminder: Invoice Overdue</div>
        </div>
        <div class="greeting">Dear ${client.name},</div>
        <p>This is a reminder that invoice <strong>${invoice.invoiceNumber}</strong> issued by <strong>${freelancer.businessName || freelancer.name}</strong> is currently overdue.</p>
        
        <div class="details-box">
          <div class="details-row">
            <strong>Invoice Number:</strong>
            <span>${invoice.invoiceNumber}</span>
          </div>
          <div class="details-row">
            <strong>Due Date:</strong>
            <span>${dueDateFormatted}</span>
          </div>
          <div class="details-row">
            <strong>Total Amount Due:</strong>
            <span>${formattedAmount}</span>
          </div>
        </div>

        <p>We appreciate your prompt attention to this matter. Please review the attached invoice PDF for payment options.</p>
        <p>Thank you!</p>

        <div class="footer">
          Sent from <strong>${freelancer.businessName || freelancer.name}</strong> via FreelanceFlow.
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  sendEmail,
  buildInvoiceEmail,
  buildOverdueEmail
};
