# SPEC — backend/src/modules/invoices/invoice.controller.js

## File Role
Handles HTTP request/response logic for Invoice operations — CRUD, status updates, sending invoice emails, and downloading PDF files. All business logic is delegated to `invoice.service.js`.

## Dependencies

| Import | Source | Purpose |
|---|---|---|
| `invoiceService` | `./invoice.service.js` | Business logic implementation for invoices |
| `generateInvoicePDF` | `./invoice.pdf.js` | PDF generation utility that returns a buffer |
| `sendSuccess`, `sendError` | `../../utils/apiResponse.js` | Standardized API response format helpers |

## Exports

### `createInvoice(req, res)`
- **Parameters**: `req.body.clientId`, `req.body.projectId`, `req.body.lineItems`, `req.body.taxRate`, `req.body.dueDate` (plus `req.user._id` from auth middleware)
- **Return value**: `void`
- **Side effects**: Invokes `invoiceService.createInvoice`
- **Throws**: Captured by `asyncHandler`

### `getInvoices(req, res)`
- **Parameters**: `req.query.page`, `req.query.limit`, `req.query.status` (plus `req.user._id`)
- **Return value**: `void`
- **Side effects**: Invokes `invoiceService.getAllInvoices`

### `getInvoiceById(req, res)`
- **Parameters**: `req.params.id` (plus `req.user._id`)
- **Return value**: `void`
- **Side effects**: None

### `updateInvoice(req, res)`
- **Parameters**: `req.params.id`, `req.body` (updatable fields) (plus `req.user._id`)
- **Return value**: `void`
- **Side effects**: Invokes `invoiceService.updateInvoice`

### `deleteInvoice(req, res)`
- **Parameters**: `req.params.id` (plus `req.user._id`)
- **Return value**: `void`
- **Side effects**: Invokes `invoiceService.archiveInvoice` (or delete)

### `sendInvoice(req, res)`
- **Parameters**: `req.params.id` (plus `req.user._id`)
- **Return value**: `void`
- **Side effects**: Invokes `invoiceService.sendInvoiceEmail` which sends SMTP email and updates status to `'sent'`

### `downloadPDF(req, res)`
- **Parameters**: `req.params.id` (plus `req.user._id`)
- **Return value**: Streams/sends a binary PDF buffer to the response
- **Side effects**: None (read-only PDF generation)
- **Response Headers**:
  - `Content-Type: application/pdf`
  - `Content-Disposition: attachment; filename=invoice-{invoiceNumber}.pdf`

### `patchStatus(req, res)`
- **Parameters**: `req.params.id`, `req.body.status` (plus `req.user._id`)
- **Return value**: `void`
- **Side effects**: Invokes `invoiceService.updateStatus`

## Data Contracts

### `POST /api/v1/invoices`
**Request Body:**
```json
{
  "clientId": "64f1a2b3c4d5e6f7a8b9c0d2",
  "projectId": "64f1a2b3c4d5e6f7a8b9c0d3",
  "lineItems": [
    {
      "description": "Consulting Services",
      "quantity": 10,
      "unitPrice": 1500
    }
  ],
  "taxRate": 18,
  "dueDate": "2026-07-28T00:00:00.000Z"
}
```
**Success Response `201`:**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d4",
    "invoiceNumber": "FF-2026-0001",
    "clientId": "64f1a2b3c4d5e6f7a8b9c0d2",
    "projectId": "64f1a2b3c4d5e6f7a8b9c0d3",
    "subtotal": 15000,
    "taxRate": 18,
    "taxAmount": 2700,
    "totalAmount": 17700,
    "amountPaid": 0,
    "status": "draft",
    "dueDate": "2026-07-28T00:00:00.000Z"
  }
}
```

### `POST /api/v1/invoices/:id/send`
**Success Response `200`:**
```json
{
  "success": true,
  "data": {
    "message": "Invoice sent successfully",
    "status": "sent"
  }
}
```

### `GET /api/v1/invoices/:id/pdf`
- **Response status `200`** with PDF binary payload.

## Rules & Constraints
- No database queries or models must be imported in this file.
- Single-resource routes must use `checkOwnership(Invoice)`.
- Updates to invoices are restricted to `'draft'` status.
- Deletions are restricted to non-`'paid'` status.
- PDF generation must return a buffer and write it directly to the response stream with `Content-Type: application/pdf`.

## Do NOT
- Do not import `Invoice`, `Client`, or `Payment` models directly.
- Do not write PDF files to disk.
- Do not use raw `res.json(...)`.

## Related Files

| File | Relationship |
|---|---|
| [invoice.service.js](file:///d:/Projects/MERN_Stack/FreelanceFlow/backend/src/modules/invoices/invoice.service.js) | Called by these handlers to execute business logic |
| [invoice.pdf.js](file:///d:/Projects/MERN_Stack/FreelanceFlow/backend/src/modules/invoices/invoice.pdf.js) | Generates the PDF buffer for download |
| [invoice.routes.js](file:///d:/Projects/MERN_Stack/FreelanceFlow/backend/src/modules/invoices/invoice.routes.js) | Maps HTTP endpoints to these controllers |