# SPEC — backend/src/modules/payments/payment.model.js

## File Role
Defines the Mongoose schema and model for a Payment — a record of money received against a specific Invoice, used to track partial and full payment history.

## Dependencies

| Import | Source | Purpose |
|---|---|---|
| `mongoose` | npm | Schema definition and model creation |

## Exports

### Default export: `Payment` (Mongoose Model)

No custom instance methods or statics.

## Data Contracts

### Schema: `paymentSchema`

| Field | Type | Required | Default | Validation / Notes |
|---|---|---|---|---|
| `invoiceId` | ObjectId | ✅ | — | `ref: 'Invoice'` — the invoice this payment applies to |
| `freelancerId` | ObjectId | ✅ | — | `ref: 'User'` — the freelancer who recorded this payment |
| `amount` | Number | ✅ | — | Must be strictly > 0; in same currency units as the invoice |
| `method` | String | ✅ | — | Enum: `['bank_transfer', 'upi', 'cash', 'paypal', 'other']` |
| `date` | Date | ✅ | `Date.now` | The actual date payment was received (allows back-dating) |
| `notes` | String | ❌ | — | Optional transaction notes/receipt ID (e.g., `"UTR: 12345678"`) |

### Schema Options
- `{ timestamps: true }` — auto-manages `createdAt` and `updatedAt`

### Indexes
| Field(s) | Type | Reason |
|---|---|---|
| `invoiceId` | Standard | Fetch all payments for an invoice |
| `freelancerId` | Standard | Fetch all payments for a freelancer |

## Rules & Constraints
- `amount` must be strictly > 0.
- `invoiceId` must belong to the same `freelancerId`.
- Recording a payment has service-layer side effects:
  - Updates the invoice `amountPaid` (cumulative total of payments).
  - Updates the invoice status:
    - If `amountPaid` < `totalAmount`, status becomes `'partially_paid'`.
    - If `amountPaid` === `totalAmount`, status becomes `'paid'` and `paidAt` is set.
- A payment cannot be recorded if it causes the total `amountPaid` to exceed the invoice `totalAmount` (enforced at service layer).
- Payments are blocked against `'draft'` or `'cancelled'` invoices.

## Do NOT
- Do not update the `Invoice` collection directly from the `Payment` model hooks — perform status sync in `payment.service.js`.
- Do not accept a payment that leads to overpayment.

## Related Files

| File | Relationship |
|---|---|
| [user.model.js](file:///d:/Projects/MERN_Stack/FreelanceFlow/backend/src/modules/auth/user.model.js) | Freelancer owner |
| [invoice.model.js](file:///d:/Projects/MERN_Stack/FreelanceFlow/backend/src/modules/invoices/invoice.model.js) | Linked invoice |
| [payment.service.js](file:///d:/Projects/MERN_Stack/FreelanceFlow/backend/src/modules/payments/payment.service.js) | Orchestrates CRUD and status syncing |
