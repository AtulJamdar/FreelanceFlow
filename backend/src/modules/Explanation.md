# EXPLANATION — backend/src/models/

## Purpose (Why does this folder/file exist?)

The `models/` folder defines the **shape of your data** — what fields exist, what types they are, which are required, and how collections relate to each other. Each file here is a Mongoose schema that maps to one MongoDB collection.

Think of models as the contract between your application and the database. If a service tries to save a document that doesn't match the schema, Mongoose rejects it before it ever reaches MongoDB.

---

## How it works (Step-by-step explanation in plain English)

Each model file does three things:
1. Define a `Schema` — the fields, types, validations, and defaults
2. Add any indexes for query performance
3. Export a `Model` — the class you use to query (`Client.find()`, `Invoice.save()`, etc.)

```js
// Generic model structure
import mongoose from 'mongoose';

const thingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // ← relationship
}, { timestamps: true }); // ← adds createdAt + updatedAt automatically

thingSchema.index({ owner: 1 }); // ← index for fast lookups by owner

const Thing = mongoose.model('Thing', thingSchema);
export default Thing;
```

---

## Models Overview

### User.js
Represents a freelancer who has an account in FreelanceFlow.

Key fields:
- `name`, `email`, `password` (hashed — never store plain text)
- `email` has `unique: true` — Mongoose creates a unique index automatically

**Important**: The password is hashed (using bcrypt) in a pre-save hook or in the auth service **before** calling `.save()`. The model itself stores the hash, never the raw password.

---

### Client.js
Represents a client that belongs to a freelancer.

Key fields:
- `name`, `email`, `phone`, `company`
- `owner: { type: ObjectId, ref: 'User' }` — links each client to the freelancer who created them

The `owner` field uses `ref: 'User'` which enables **populate** (explained below).

---

### Project.js
Represents a project/engagement for a client.

Key fields:
- `title`, `description`, `status` (enum: `active`, `completed`, `paused`)
- `client: { type: ObjectId, ref: 'Client' }` — which client this project belongs to
- `owner: { type: ObjectId, ref: 'User' }` — which freelancer owns it
- `startDate`, `endDate`

---

### Milestone.js
Represents a deliverable or checkpoint within a project.

Key fields:
- `title`, `dueDate`, `status` (enum: `pending`, `completed`)
- `project: { type: ObjectId, ref: 'Project' }` — parent project
- `owner: { type: ObjectId, ref: 'User' }`

---

### Invoice.js
The most complex model — represents a billable invoice sent to a client.

Key fields:
- `invoiceNumber` — auto-generated unique identifier (e.g., `INV-0042`)
- `client: { type: ObjectId, ref: 'Client' }`
- `project: { type: ObjectId, ref: 'Project' }` (optional)
- `items: [{ description, quantity, unitPrice, amount }]` — line items array
- `totalAmount`, `tax`, `discount`
- `status` (enum: `draft`, `sent`, `paid`, `overdue`)
- `dueDate`, `issuedDate`
- `owner: { type: ObjectId, ref: 'User' }`

---

### Payment.js
Records a payment received against an invoice.

Key fields:
- `invoice: { type: ObjectId, ref: 'Invoice' }`
- `amount`, `method` (enum: `bank_transfer`, `cash`, `upi`, etc.)
- `paidAt` (date of payment)
- `owner: { type: ObjectId, ref: 'User' }`

---

## Key decisions

### Why `ref` and `populate`?

MongoDB is a document database — it doesn't do SQL-style joins natively. Mongoose's `ref` + `populate` simulates this.

```js
// When you query an invoice:
const invoice = await Invoice.findById(id).populate('client');
// Without populate → invoice.client = ObjectId("abc123")
// With populate    → invoice.client = { name: "Acme Corp", email: "...", ... }
```

**Why store ObjectIds instead of embedding the full document?**
- Embedding (nesting client inside invoice) causes **data duplication** — if the client's email changes, you'd need to update every invoice
- Storing a reference (ObjectId) means there's one source of truth — the Client document
- `populate` fetches the referenced document on demand

**When to embed vs. reference:**
- **Embed** when the sub-document is small, doesn't change, and is only used with its parent (e.g., invoice line items)
- **Reference** when the sub-document is shared across multiple parents or changes independently (e.g., clients, users)

### Why `{ timestamps: true }`?

Adding `{ timestamps: true }` as the second argument to `Schema` automatically adds:
- `createdAt` — when the document was first saved
- `updatedAt` — when the document was last modified

You never need to set these manually. They're invaluable for debugging ("when did this invoice get created?") and for features like sorting by newest first.

### Why add indexes?

```js
invoiceSchema.index({ owner: 1, status: 1 });
```

An **index** is a data structure MongoDB maintains alongside your collection that makes lookups fast. Without an index, MongoDB scans every document in the collection to find matches (a "collection scan"). With an index, it jumps directly to the right documents.

**When to add indexes:**
- Fields you frequently filter by (e.g., `owner`, `status`, `dueDate`)
- Fields used in sort operations
- Fields used in `populate` (Mongoose indexes `_id` automatically, but not foreign keys)

**Trade-off**: Indexes speed up reads but slow down writes (because the index must be updated on every insert/update). For FreelanceFlow's scale, this trade-off strongly favors indexing.

### Why enums on status fields?

```js
status: { type: String, enum: ['draft', 'sent', 'paid', 'overdue'], default: 'draft' }
```

Enums prevent invalid values at the database level. If a service accidentally sets `status: 'PAID'` (wrong case) or `status: 'pending'` (not a valid invoice status), Mongoose throws a validation error immediately — you catch the bug at the source, not in a frontend display bug three weeks later.

---

## Functions / Exports

Each model exports a Mongoose Model class. Key methods you'll use:

| Method | What it does |
|---|---|
| `Model.find({ owner: id })` | Find all documents matching filter |
| `Model.findById(id)` | Find one document by its `_id` |
| `Model.findByIdAndUpdate(id, update, { new: true })` | Update and return the updated doc |
| `Model.findByIdAndDelete(id)` | Delete one document |
| `new Model(data).save()` | Create and save a new document |
| `.populate('client')` | Replace ObjectId with the full referenced document |

**Gotcha with `findByIdAndUpdate`**: Always pass `{ new: true }` as the third argument if you want the updated document back. Without it, Mongoose returns the document *before* the update.

---

## What you should learn from this

- **Mongoose schemas**: How to define data shape, types, validations, and defaults
- **ObjectId references**: How MongoDB handles relationships without SQL foreign keys
- **populate**: How to "join" related documents in Mongoose
- **Embed vs. reference**: The fundamental design decision in document databases
- **Indexes**: Why they exist, when to add them, and what the trade-off is
- **Enums**: Using schema-level validation to catch bad data early
- **timestamps**: Letting Mongoose handle `createdAt`/`updatedAt` automatically