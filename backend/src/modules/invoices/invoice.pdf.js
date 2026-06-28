const PDFDocument = require('pdfkit');

/**
 * Generates an invoice PDF in-memory as a binary Buffer
 * @param {object} invoice - Invoice database object
 * @param {object} freelancer - Freelancer user profile
 * @param {object} client - Client database object
 * @returns {Promise<Buffer>} Resolves with PDF file Buffer
 */
const generateInvoicePDF = (invoice, freelancer, client) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      // Collect PDF data chunks into buffers array
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // Helper: Format Dates to human-readable format (e.g. "28 Jun 2026")
      const formatDate = (dateVal) => {
        if (!dateVal) return '';
        const d = new Date(dateVal);
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        return d.toLocaleDateString('en-GB', options);
      };

      // Helper: Format Currency to Indian Rupees (INR)
      const formatCurrency = (val) => {
        return val.toLocaleString('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 2
        });
      };

      // --- HEADER SECTION ---
      // Left-aligned: Freelancer Info
      doc.fillColor('#2d3748');
      doc.font('Helvetica-Bold').fontSize(18).text(freelancer.businessName || freelancer.name);
      
      doc.font('Helvetica').fontSize(10).fillColor('#4a5568');
      doc.text(freelancer.name);
      doc.text(freelancer.email);
      if (freelancer.phone) doc.text(`Phone: ${freelancer.phone}`);
      if (freelancer.address) doc.text(`Address: ${freelancer.address}`);

      // Right-aligned: Invoice Metadata (absolute horizontal position)
      doc.font('Helvetica-Bold').fontSize(22).fillColor('#1a0dab').text('INVOICE', 350, 50, { align: 'right', width: 200 });
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#4a5568').text(`Invoice #: ${invoice.invoiceNumber}`, 350, 80, { align: 'right', width: 200 });
      
      const issueDateFormatted = formatDate(invoice.issueDate || invoice.createdAt);
      const dueDateFormatted = formatDate(invoice.dueDate);
      
      doc.font('Helvetica').text(`Issue Date: ${issueDateFormatted}`, 350, 95, { align: 'right', width: 200 });
      doc.text(`Due Date: ${dueDateFormatted}`, 350, 110, { align: 'right', width: 200 });

      // Draw Separator Line
      doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, 150).lineTo(550, 150).stroke();

      // --- BILL TO SECTION ---
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#718096').text('BILL TO:', 50, 165);
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#2d3748').text(client.name, 50, 180);
      
      doc.font('Helvetica').fontSize(10).fillColor('#4a5568');
      if (client.company) doc.text(client.company);
      doc.text(client.email);
      if (client.phone) doc.text(`Phone: ${client.phone}`);
      if (client.address) doc.text(`Address: ${client.address}`);

      // --- LINE ITEMS TABLE ---
      let yPos = doc.y + 25;
      
      // Table Header Background
      doc.rect(50, yPos, 500, 20).fill('#edf2f7');
      doc.fillColor('#4a5568');
      
      doc.font('Helvetica-Bold').fontSize(9);
      doc.text('Description', 60, yPos + 6, { width: 240 });
      doc.text('Qty', 310, yPos + 6, { width: 40, align: 'right' });
      doc.text('Unit Price', 360, yPos + 6, { width: 90, align: 'right' });
      doc.text('Total', 460, yPos + 6, { width: 80, align: 'right' });

      yPos += 20;

      // Table Rows
      doc.font('Helvetica').fontSize(9).fillColor('#2d3748');
      for (const item of invoice.lineItems) {
        doc.text(item.description, 60, yPos + 6, { width: 240 });
        doc.text(String(item.quantity), 310, yPos + 6, { width: 40, align: 'right' });
        doc.text(formatCurrency(item.unitPrice), 360, yPos + 6, { width: 90, align: 'right' });
        doc.text(formatCurrency(item.total), 460, yPos + 6, { width: 80, align: 'right' });
        
        yPos += 20;
        doc.strokeColor('#f7fafc').lineWidth(0.5).moveTo(50, yPos).lineTo(550, yPos).stroke();
      }

      // Draw Summary Top Separator
      doc.strokeColor('#cbd5e0').lineWidth(1).moveTo(50, yPos).lineTo(550, yPos).stroke();
      yPos += 10;

      // --- TOTALS SUMMARY ---
      doc.font('Helvetica').fontSize(10).fillColor('#4a5568');
      doc.text('Subtotal:', 340, yPos, { width: 110, align: 'right' });
      doc.text(formatCurrency(invoice.subtotal), 460, yPos, { width: 80, align: 'right' });
      
      yPos += 18;
      
      if (invoice.taxRate > 0) {
        doc.text(`Tax (${invoice.taxRate}%):`, 340, yPos, { width: 110, align: 'right' });
        doc.text(formatCurrency(invoice.taxAmount), 460, yPos, { width: 80, align: 'right' });
        yPos += 18;
      }

      doc.font('Helvetica-Bold').fontSize(11).fillColor('#1a0dab');
      doc.text('Total Amount:', 340, yPos, { width: 110, align: 'right' });
      doc.text(formatCurrency(invoice.totalAmount), 460, yPos, { width: 80, align: 'right' });

      yPos += 30;

      // --- FOOTER & NOTES ---
      if (invoice.notes) {
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#718096').text('Notes & Payment Terms:', 50, yPos);
        doc.font('Helvetica').fontSize(9).fillColor('#4a5568').text(invoice.notes, 50, yPos + 15, { width: 500 });
      }

      // End streaming
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateInvoicePDF
};
