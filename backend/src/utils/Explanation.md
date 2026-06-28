# EXPLANATION — backend/src/utils/

## Purpose (Why does this folder/file exist?)

The `utils/` folder contains **reusable helper functions** that don't belong to any specific resource. They're tools that multiple parts of the app can call — like a shared toolbox.

In FreelanceFlow, the two main utilities are:
1. **`pdfGenerator.js`** — generates a PDF invoice using PDFKit
2. **`emailService.js`** — sends emails using Nodemailer

---

## How it works (Step-by-step explanation in plain English)

### pdfGenerator.js — Invoice PDF with PDFKit

PDFKit is a Node.js library that creates PDF files programmatically — you write code that draws text, lines, and tables onto a virtual page, and PDFKit produces the binary PDF output.

**Step-by-step:**

1. Create a new `PDFDocument` instance — this is the blank "page"
2. Pipe the document's output to a writable stream — either a file or an HTTP response
3. Add content: title, client info, line items table, totals
4. Call `doc.end()` — finalizes the PDF

```js
import PDFDocument from 'pdfkit';

const generateInvoicePDF = (invoice, res) => {
  const doc = new PDFDocument({ margin: 50 });

  // Pipe directly to the HTTP response
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);
  doc.pipe(res);

  // ── Header ──────────────────────────────────────
  doc.fontSize(24).text('INVOICE', { align: 'right' });
  doc.fontSize(12).text(`Invoice #: ${invoice.invoiceNumber}`, { align: 'right' });
  doc.text(`Date: ${new Date(invoice.issuedDate).toLocaleDateString()}`, { align: 'right' });
  doc.text(`Due: ${new Date(invoice.dueDate).toLocaleDateString()}`, { align: 'right' });

  doc.moveDown();

  // ── Client Info ─────────────────────────────────
  doc.fontSize(14).text('Bill To:');
  doc.fontSize(12).text(invoice.client.name);
  doc.text(invoice.client.email);

  doc.moveDown();

  // ── Line Items ──────────────────────────────────
  doc.fontSize(14).text('Items:');
  invoice.items.forEach((item) => {
    doc.fontSize(11).text(
      `${item.description}  ×${item.quantity}  @ ₹${item.unitPrice}  =  ₹${item.amount}`
    );
  });

  doc.moveDown();

  // ── Totals ──────────────────────────────────────
  doc.fontSize(13).text(`Total: ₹${invoice.totalAmount}`, { align: 'right' });

  doc.end(); // ← IMPORTANT: always call this to finalize
};

export default generateInvoicePDF;
```

**Key concept — streaming**: The PDF is never written to disk. It's streamed directly into the HTTP response. This is memory-efficient and faster because you don't need a temp file step.

---

### emailService.js — Sending Emails with Nodemailer

Nodemailer is a Node.js library for sending emails via SMTP. It connects to an email provider (Gmail, SendGrid, Mailgun, etc.) and sends messages programmatically.

**Step-by-step:**

1. Create a **transporter** — a configured connection to your SMTP provider
2. Define the **mail options** — from, to, subject, body (text or HTML)
3. Call `transporter.sendMail(options)` — sends the email

```js
import nodemailer from 'nodemailer';

// Create transporter once (reuse across calls)
const transporter = nodemailer.createTransport({
  service: 'gmail', // or use host/port for custom SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // use an App Password, not your real Gmail password
  },
});

const sendInvoiceEmail = async ({ to, invoiceNumber, clientName, amount, dueDate }) => {
  const mailOptions = {
    from: `"FreelanceFlow" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Invoice ${invoiceNumber} from FreelanceFlow`,
    html: `
      <h2>Hello ${clientName},</h2>
      <p>Please find your invoice <strong>${invoiceNumber}</strong> attached.</p>
      <p><strong>Amount Due:</strong> ₹${amount}</p>
      <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
      <br/>
      <p>Thank you for your business.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export { sendInvoiceEmail };
```

For Gmail: you must enable "App Passwords" in your Google Account (2FA required). Never use your real Gmail password in `EMAIL_PASS`.

---

## Key decisions

### Why utils instead of services?

This is a naming convention question, and reasonable developers disagree. In FreelanceFlow:

- **Services** (e.g., `invoiceService.js`) contain business logic *specific to a resource* — they know about the Invoice model, they query the DB, they enforce ownership rules
- **Utils** are *resource-agnostic* helpers — `generateInvoicePDF` just takes an invoice object and produces a PDF. It doesn't know how to fetch an invoice from the DB. `sendEmail` just takes parameters and sends an email — it doesn't care about business rules.

Utils can be called from any service. Services are called from controllers. The distinction keeps responsibilities clear.

**Alternative naming you might see elsewhere:**
- `helpers/` instead of `utils/`
- `lib/` for third-party integrations
- Some projects put email in a `services/emailService.js` — that's also valid if email sending involves significant business logic (templates stored in DB, scheduling, tracking)

### Why stream the PDF to the response instead of saving to disk?

Saving to disk requires:
1. Write temp file to `/tmp/invoice-123.pdf`
2. Send file as response
3. Delete temp file

Streaming directly:
1. Stream PDF bytes directly into `res`

Streaming is simpler, faster, and avoids disk I/O. It also avoids a class of bugs where temp files accumulate because step 3 was skipped during an error.

**When you'd save to disk**: If you need to email the PDF as an attachment, you need the PDF as a Buffer or file path. In that case, stream to a `Buffer` using `getBuffer()` or pipe to a `PassThrough` stream.

### Why Nodemailer instead of a transactional email API (SendGrid, Mailgun)?

Nodemailer with Gmail is the lowest-friction setup for a personal/portfolio project — no API keys to provision, no account to create. For production use with real clients, you'd switch to SendGrid or AWS SES because:
- Better deliverability (Gmail has strict sending limits ~500/day)
- Email tracking (opens, clicks)
- Template management
- Bounce/spam handling

The switch requires only changing the `transporter` configuration — the rest of the code stays the same.

---

## Functions / Exports

### `generateInvoicePDF(invoice, res)`
- **What it does**: Generates a PDF invoice and pipes it directly to the HTTP response
- **Parameters**:
  - `invoice` — populated invoice object (client and items must be populated, not just ObjectIds)
  - `res` — Express response object
- **Returns**: void (streams to `res`)
- **Gotchas**:
  - `invoice.client` must be populated before calling this — call `.populate('client')` in the service
  - Always call `doc.end()` — forgetting it leaves the response hanging forever
  - Cannot send JSON response after calling this — `res` is already being used for the PDF stream

### `sendInvoiceEmail({ to, invoiceNumber, clientName, amount, dueDate })`
- **What it does**: Sends an invoice notification email to the client
- **Parameters**: Object with email address and invoice details
- **Returns**: `Promise<void>` — resolves when email is sent
- **Gotchas**:
  - `EMAIL_USER` and `EMAIL_PASS` must be set in `.env`
  - Gmail App Passwords are required if using 2FA (which you should be)
  - SMTP calls are async and can fail (network issues, rate limits) — always wrap in try-catch in the calling service

---

## What you should learn from this

- **PDFKit streaming**: Generating PDFs in memory and streaming to a response — no temp files needed
- **Nodemailer transporter**: How SMTP authentication works and why App Passwords exist
- **Utils vs. services**: Why resource-agnostic helpers live separately from business logic
- **Environment variables for credentials**: Never hardcode email passwords or API keys
- **Streaming responses**: Setting `Content-Type` and `Content-Disposition` headers for file downloads