# SPEC — backend/src/utils/email.js

## File Role
Configures a global Nodemailer transporter and exposes functions to send transactional emails (with support for attachments) and build standard email HTML templates.

## Dependencies

| Import | Source | Purpose |
|---|---|---|
| `nodemailer` | npm | SMTP transporter configuration and email dispatch |

## Exports

### `sendEmail(options)`
- **Parameters**: `options` (object, required)
  - `to` (string, required): Recipient email address
  - `subject` (string, required): Email subject line
  - `html` (string, required): HTML body content
  - `attachments` (array, optional): Array of attachment objects, e.g., `[{ filename: 'invoice.pdf', content: buffer }]`
- **Return value**: `Promise<object>` — Resolves with the Nodemailer sent info object
- **Side effects**: Dispatches email over SMTP
- **Throws**: Rejects if SMTP connection or authentication fails

### `buildInvoiceEmail(invoice, freelancer, client)`
- **Parameters**: `invoice` (object), `freelancer` (object), `client` (object)
- **Return value**: `string` — Ready-to-use HTML email body template for newly sent invoices

### `buildOverdueEmail(invoice, freelancer, client)`
- **Parameters**: `invoice` (object), `freelancer` (object), `client` (object)
- **Return value**: `string` — Ready-to-use HTML email body template for overdue payment reminders

## Data Contracts

### Transporter Config
Initialized once at module load:
```js
nodemailer.createTransport({
  service: 'gmail', // or custom SMTP settings from environment
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})
```

### Required Environment Variables
- `EMAIL_USER`: Email username / Gmail account address
- `EMAIL_PASS`: Gmail App Password (or custom SMTP password)

## Rules & Constraints
- The Nodemailer transporter must be created once at module level (reused across all sends).
- All emails must include a plain text representation or standard clean HTML formatting.
- `attachments` support is mandatory for sending PDFs.
- Errors must be propagated to the caller — do not swallow SMTP exceptions inside `sendEmail`.

## Do NOT
- Do not import Mongoose models or query the database in this file.
- Do not hardcode login credentials.

## Related Files

| File | Relationship |
|---|---|
| [server.js](file:///d:/Projects/MERN_Stack/FreelanceFlow/backend/server.js) | Initializes environment variables before this is loaded |
| [invoice.service.js](file:///d:/Projects/MERN_Stack/FreelanceFlow/backend/src/modules/invoices/invoice.service.js) | Calls this to build and send invoice emails with PDF attachments |
| [overdue.job.js](file:///d:/Projects/MERN_Stack/FreelanceFlow/backend/src/jobs/overdue.job.js) | Calls this to build and send overdue reminder emails |
