# SPEC — backend/src/modules/invoices/invoice.model.js

## File Role
Defines the Mongoose schema and model for an Invoice — the core billing document, containing line items, computed tax and total amounts, payment status lifecycle, and references to client, project, and freelancer.

## Dependencies

| Import | Source | Purpose |
|---|---|---|
| `mongoose` | npm | Schema definition and model creation |

## Exports

### Default export: `Invoice` (Mongoose Model)

No custom instance methods.

## Data Contracts

### Schema: `invoiceSchema`

#### Top-level fields

| Field | Type | Required | Default | Validation / Notes |
|---|---|---|---|---|
| `invoiceNumber` | String | ✅ | — | Unique, auto-generated sequence via `invoiceNumber.js` helper (e.g., `FF-2026-0001`) |
| `freelancerId` | ObjectId | ✅ | — | `ref: 'User'` — owner freelancer account |
| `clientId` | ObjectId | ✅ | — | `ref: 'Client'` — client being billed |
| `projectId` | ObjectId | ✅ | — | `ref: 'Project'` — related project |
| `lineItems` | [lineItemSchema] | ✅ | `[]` | Array of line items (must have at least 1 item) |
| `subtotal` | Number | ✅ | `0` | Computed: sum of all `lineItem.total` values |
| `taxRate` | Number | ✅ | `0` | Percentage (0 to 100) |
| `taxAmount` | Number | ✅ | `0` | Computed: `subtotal * (taxRate / 100)` |
| `totalAmount` | Number | ✅ | `0` | Computed: `subtotal + taxAmount` |
| `amountPaid` | Number | ✅ | `0` | Running sum of recorded payments; default 0 |
| `status` | String | ✅ | `'draft'` | Enum: `['draft', 'sent', 'partially_paid', 'paid', 'overdue']` |
| `dueDate` | Date | ✅ | — | Payment due date |
| `sentAt` | Date | ❌ | — | Timestamp of when invoice was sent to client |
| `paidAt` | Date | ❌ | — | Timestamp of when invoice was fully paid |

#### Embedded sub-schema: `lineItemSchema`

| Field | Type | Required | Default | Validation / Notes |
|---|---|---|---|---|
| `description` | String | ✅ | — | Line item description |
| `quantity` | Number | ✅ | `1` | Must be >= 1 |
| `unitPrice` | Number | ✅ | — | Must be >= 0 |
| `total` | Number | ✅ | — | Computed: `quantity * unitPrice` |

### Schema Options
- `{ timestamps: true }` — auto-manages `createdAt` and `updatedAt`

### Indexes
| Field(s) | Type | Reason |
|---|---|---|
| `freelancerId` | Standard | Fetch all invoices for a freelancer |
| `freelancerId` + `status` | Compound | Filter invoices by status |
| `freelancerId` + `dueDate` | Compound | Fast query for overdue cron jobs |
| `invoiceNumber` | Unique | Enforces global uniqueness of invoice numbers |

## Rules & Constraints
- `lineItems` must have at least 1 item.
- `lineItem.total` must equal `quantity * unitPrice` (enforced at service layer).
- `subtotal` must equal the sum of `lineItem.total` values (enforced at service layer).
- `taxAmount` must equal `subtotal * (taxRate / 100)`.
- `totalAmount` must equal `subtotal + taxAmount`.
- `amountPaid` must be a running sum of all payment amounts, and must never exceed `totalAmount`.
- `invoiceNumber` must be unique and is generated atomically at creation time using the `nextInvoiceNumber` helper.
- Allowed status flows:
  - `draft` → `sent`
  - `sent` → `partially_paid` / `paid`
  - `sent` → `overdue` (via cron job)
  - `partially_paid` → `paid` / `overdue`
- `sentAt` is set when status transitions to `sent`.
- `paidAt` is set when status transitions to `paid`.

## Do NOT
- Do not let clients or controllers set `invoiceNumber` manually.
- Do not perform invoice calculations directly in this model file — perform in the service layer before saving.
- Do not store draft/unsaved PDFs inside this model.

## Related Files

| File | Relationship |
|---|---|
| [user.model.js](file:///d:/Projects/MERN_Stack/FreelanceFlow/backend/src/modules/auth/user.model.js) | Freelancer owner |
| [client.model.js](file:///d:/Projects/MERN_Stack/FreelanceFlow/backend/src/modules/clients/client.model.js) | Billed client |
| [project.model.js](file:///d:/Projects/MERN_Stack/FreelanceFlow/backend/src/modules/projects/project.model.js) | Linked project |
| [invoice.service.js](file:///d:/Projects/MERN_Stack/FreelanceFlow/backend/src/modules/invoices/invoice.service.js) | Handles creation and calculations |
| [invoiceNumber.js](file:///d:/Projects/MERN_Stack/FreelanceFlow/backend/src/utils/invoiceNumber.js) | Generates `invoiceNumber` |
