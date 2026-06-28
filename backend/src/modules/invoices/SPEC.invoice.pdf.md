# SPEC — backend/src/modules/invoices/invoice.pdf.js

## File Role
Generates a highly-formatted, professional invoice PDF from invoice, freelancer, and client data in memory using PDFKit, and returns a binary Buffer. No disk writes are permitted.

## Dependencies

| Import | Source | Purpose |
|---|---|---|
| `pdfkit` | npm | PDF document creation |

## Exports

### Named export: `generateInvoicePDF(invoice, freelancer, client)`
- **Parameters**:
  - `invoice` (object, required): The invoice document with fields (`invoiceNumber`, `lineItems`, `taxRate`, `taxAmount`, `subtotal`, `totalAmount`, `dueDate`, `notes`)
  - `freelancer` (object, required): The freelancer profile details (`name`, `email`, `businessName`, `phone`, `address`)
  - `client` (object, required): The client profile details (`name`, `email`, `company`, `phone`, `address`)
- **Return value**: `Promise<Buffer>` — Resolves with the PDF binary Buffer
- **Side effects**: None (operates purely in-memory)
- **Throws**: Propagates any internal PDFKit errors

## Data Contracts

### Expected Parameter Shapes

#### `invoice`
```js
{
  invoiceNumber: "FF-2026-0001",
  dueDate: Date,
  lineItems: [{ description: "Services", quantity: 1, unitPrice: 500, total: 500 }],
  subtotal: 500,
  taxRate: 18,
  taxAmount: 90,
  totalAmount: 590,
  notes: "Due on receipt"
}
```

#### `freelancer`
```js
{
  name: "Jane Doe",
  email: "jane@example.com",
  businessName: "JD Designs",
  phone: "+91-9999999999",
  address: "123 Street, Mumbai"
}
```

#### `client`
```js
{
  name: "John Client",
  email: "john@client.com",
  company: "Client LLC",
  phone: "+91-8888888888",
  address: "456 Avenue, Delhi"
}
```

## PDF Layout
1. **Header (Left)**: Freelancer business name / personal name, email, phone, address.
2. **Header (Right)**: "INVOICE", invoice number, issue date, due date.
3. **Bill To Section**: Client name, company, email, phone, address.
4. **Line Items Table**: Clean layout with columns (Description | Qty | Unit Price | Total).
5. **Totals Section (Right Aligned)**:
   - Subtotal
   - Tax (displayed if `taxRate > 0`)
   - Grand Total (Bold)
6. **Footer / Notes**: Renders any custom invoice notes at the bottom.

## Rules & Constraints
- Must not write files to disk (`fs.writeFile` is strictly prohibited).
- The PDF must be accumulated using a buffer collection stream and resolved as a Node `Buffer`.
- Number values must be formatted as currency using `toLocaleString('en-IN', { style: 'currency', currency: 'INR' })` or fixed decimals.
- Date strings in the PDF must be human-readable (e.g. `"28 Jun 2026"`).

## Do NOT
- Do not import Mongoose models or query the database in this file.
- Do not stream directly to the HTTP response inside this file.
- Do not write to disk.

## Related Files

| File | Relationship |
|---|---|
| [invoice.controller.js](file:///d:/Projects/MERN_Stack/FreelanceFlow/backend/src/modules/invoices/invoice.controller.js) | Calls this to get the buffer for PDF downloads |
| [invoice.service.js](file:///d:/Projects/MERN_Stack/FreelanceFlow/backend/src/modules/invoices/invoice.service.js) | Calls this to get the buffer for email attachments |
| [email.js](file:///d:/Projects/MERN_Stack/FreelanceFlow/backend/src/utils/email.js) | Receives the output buffer to send via SMTP |
