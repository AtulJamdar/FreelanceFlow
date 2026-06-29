# FreelanceFlow — Task Breakdown

**Version:** 1.0  
**Date:** 2026-06-28  
**Total Tasks:** 58  
**Source:** Derived from PRD.md v1.0

> **How to use this file:** Work top to bottom within each phase. Check off tasks as you complete them. Never start a task before its `Depends On` task is checked. P0 tasks must be complete before moving to Phase 6+.

---

## Quick Status Overview

| Phase | Name | Tasks | Priority |
|-------|------|-------|----------|
| 1 | Project Setup & Infrastructure | T-001 → T-008 | Foundation |
| 2 | Authentication | T-009 → T-014 | P0 |
| 3 | Client API | T-015 → T-020 | P0 |
| 4 | Project & Milestone API | T-021 → T-030 | P0 |
| 5 | Invoice API | T-031 → T-040 | P0 |
| 6 | Payment API | T-041 → T-044 | P0 |
| 7 | Automation (Cron + Email) | T-045 → T-049 | P0 |
| 8 | Dashboard API | T-050 → T-051 | P1 |
| 9 | Frontend | T-052 → T-056 | P1 |
| 10 | Deployment & Polish | T-057 → T-058 | Final |

---

## Phase 1 — Project Setup & Infrastructure

> Goal: A running Express server connected to MongoDB Atlas, with the full folder structure in place and all dependencies installed.

---

- [x] **T-001 — Initialize Backend Repository**
  - **Description:** Create the `freelanceflow-backend` Node.js project with `npm init`, install all backend dependencies, and configure `.gitignore`.
  - **Files to create:** `package.json`, `.gitignore`, `.env`, `.env.example`
  - **Depends On:** —
  - **Install:** `express mongoose dotenv bcryptjs jsonwebtoken express-validator express-rate-limit cors helmet morgan pdfkit nodemailer node-cron`
  - **Dev install:** `nodemon`

---

- [x] **T-002 — Build Folder Structure (Backend)**
  - **Description:** Scaffold the complete feature-based backend directory structure as specified. No code yet — just folders and placeholder `index.js` files.
  - **Files to create:**
    ```
    src/
      config/
        db.js
        env.js
      middleware/
        auth.js
        errorHandler.js
        asyncHandler.js
        validate.js
      modules/
        auth/
          auth.routes.js
          auth.controller.js
          auth.service.js
          auth.validator.js
        clients/
          client.routes.js
          client.controller.js
          client.service.js
          client.validator.js
          client.model.js
        projects/
          project.routes.js
          project.controller.js
          project.service.js
          project.validator.js
          project.model.js
        milestones/
          milestone.routes.js
          milestone.controller.js
          milestone.service.js
          milestone.validator.js
          milestone.model.js
        invoices/
          invoice.routes.js
          invoice.controller.js
          invoice.service.js
          invoice.validator.js
          invoice.model.js
          invoice.pdf.js
        payments/
          payment.routes.js
          payment.controller.js
          payment.service.js
          payment.validator.js
          payment.model.js
        dashboard/
          dashboard.routes.js
          dashboard.controller.js
          dashboard.service.js
      jobs/
        overdue.job.js
      utils/
        email.js
        invoiceNumber.js
        apiResponse.js
      app.js
    server.js
    ```
  - **Depends On:** T-001

---

- [x] **T-003 — MongoDB Atlas Connection**
  - **Description:** Implement the database connection using Mongoose. Connect on server start, log success/failure, and export the connection for use across modules.
  - **Files to create/modify:** `src/config/db.js`, `server.js`
  - **Depends On:** T-002
  - **Key logic:** `mongoose.connect(process.env.MONGODB_URI)` with error handling; retry logic not required for MVP.

---

- [x] **T-004 — Express App Bootstrap**
  - **Description:** Wire up the Express app with all global middleware: CORS, Helmet, Morgan, JSON body parser, and the global error handler. Mount the API router at `/api/v1`.
  - **Files to create/modify:** `src/app.js`, `server.js`
  - **Depends On:** T-003
  - **Middleware order:** `helmet` → `cors` → `morgan` → `express.json()` → routes → `errorHandler`

---

- [x] **T-005 — Shared Utility: asyncHandler**
  - **Description:** Create the `asyncHandler` HOF that wraps every async route handler to eliminate try-catch boilerplate. All controllers must use this wrapper.
  - **Files to create:** `src/middleware/asyncHandler.js`
  - **Depends On:** T-002
  - **Pattern:** `const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);`

---

- [x] **T-006 — Shared Utility: Standard API Response Helpers**
  - **Description:** Create `apiResponse.js` with `sendSuccess(res, data, statusCode)` and `sendError(res, code, message, field, statusCode)` helpers that enforce the PRD error shape across all endpoints.
  - **Files to create:** `src/utils/apiResponse.js`
  - **Depends On:** T-002
  - **Error shape:** `{ success: false, error: { code, message, field } }` — see PRD §5.2

---

- [x] **T-007 — Global Error Handler Middleware**
  - **Description:** Implement the Express error-handling middleware (4-argument signature). Handles Mongoose `ValidationError`, `CastError` (invalid ObjectId), JWT errors, and generic 500s. Returns standardized error shape.
  - **Files to create:** `src/middleware/errorHandler.js`
  - **Depends On:** T-005, T-006
  - **Cases to handle:** `ValidationError` → 400, `CastError` → 400 (invalid ID), `JsonWebTokenError` → 401, `TokenExpiredError` → 401, default → 500

---

- [x] **T-008 — Initialize Frontend Repository**
  - **Description:** Create the `freelanceflow-frontend` React project using Vite, install Tailwind CSS, configure `tailwind.config.js`, set up the `VITE_API_BASE_URL` env variable, and create the base folder structure.
  - **Files to create:** `freelanceflow-frontend/` (separate repo or monorepo subfolder), `src/api/axios.js`, `src/pages/`, `src/components/`, `.env`, `.env.example`
  - **Depends On:** T-001
  - **Install:** `axios`, `react-router-dom`, `tailwindcss`, `@headlessui/react`

---

## Phase 2 — Authentication

> Goal: Freelancer can register, log in, receive a JWT, and update their profile. All other routes are protected.

---

- [x] **T-009 — User Mongoose Model**
  - **Description:** Define the `User` Mongoose schema with all fields from PRD §6.1. Add a pre-save hook to hash `password` with bcrypt (12 rounds). Add an instance method `comparePassword(candidate)`. Never return `passwordHash` in API responses (use `.select('-passwordHash')`).
  - **Files to create/modify:** `src/modules/auth/user.model.js`
  - **Depends On:** T-003
  - **Fields:** `name`, `email` (unique, lowercase), `passwordHash`, `businessName`, `phone`, `address`, `createdAt`, `updatedAt`

---

- [x] **T-010 — JWT Auth Middleware**
  - **Description:** Implement `protect` middleware that reads the `Authorization: Bearer <token>` header, verifies the JWT using `JWT_SECRET`, fetches the user from DB, and attaches `req.user` for downstream use. Returns 401 on missing/invalid/expired tokens.
  - **Files to create/modify:** `src/middleware/auth.js`
  - **Depends On:** T-009
  - **Logic:** Extract token → `jwt.verify()` → `User.findById(payload.userId).select('-passwordHash')` → `req.user = user` → `next()`

---

- [x] **T-011 — Auth Validators**
  - **Description:** Define `express-validator` chains for `register` (name required, email valid, password min 8) and `login` (email valid, password present). Create reusable `validate` middleware that reads validation results and returns 400 with field-level errors.
  - **Files to create/modify:** `src/modules/auth/auth.validator.js`, `src/middleware/validate.js`
  - **Depends On:** T-006

---

- [x] **T-012 — Auth Service**
  - **Description:** Implement business logic for `registerUser` (check duplicate email, create user, sign JWT) and `loginUser` (find by email, compare password, sign JWT). JWT expires in `7d`. Never put sensitive data in JWT payload.
  - **Files to create/modify:** `src/modules/auth/auth.service.js`
  - **Depends On:** T-010, T-011
  - **JWT payload:** `{ userId: user._id, email: user.email }`

---

- [x] **T-013 — Auth Controller & Routes**
  - **Description:** Wire up the 4 auth endpoints: `POST /register`, `POST /login`, `GET /me` (protected), `PUT /me` (protected, update profile fields). Controllers call service methods, use `asyncHandler`, return standardized responses.
  - **Files to create/modify:** `src/modules/auth/auth.controller.js`, `src/modules/auth/auth.routes.js`, `src/app.js`
  - **Depends On:** T-012

---

- [x] **T-014 — Auth Rate Limiting**
  - **Description:** Apply `express-rate-limit` to all `/api/v1/auth/*` routes: max 10 requests per IP per 15 minutes. Return 429 with a clear message on limit exceeded.
  - **Files to create/modify:** `src/modules/auth/auth.routes.js`
  - **Depends On:** T-013

---

## Phase 3 — Client API

> Goal: Full CRUD for client records. Soft delete enforced. Email uniqueness per freelancer enforced.

---

- [x] **T-015 — Client Mongoose Model**
  - **Description:** Define the `Client` schema per PRD §6.2. Index `{ freelancerId, email }` with a unique compound index to enforce per-freelancer email uniqueness. Add `isArchived: false` default.
  - **Files to create:** `src/modules/clients/client.model.js`
  - **Depends On:** T-003
  - **Index:** `clientSchema.index({ freelancerId: 1, email: 1 }, { unique: true })`

---

- [x] **T-016 — Client Validators**
  - **Description:** Define validation chains for `createClient` (name required, email required + valid format, optional fields) and `updateClient` (all fields optional but email must be valid if provided).
  - **Files to create:** `src/modules/clients/client.validator.js`
  - **Depends On:** T-011

---

- [x] **T-017 — Client Service**
  - **Description:** Implement: `createClient`, `getAllClients` (with pagination: `?page&limit&sort&isArchived`), `getClientById` (with project count via populate or aggregate), `updateClient`, `archiveClient` (set `isArchived: true`; block if active projects exist).
  - **Files to create:** `src/modules/clients/client.service.js`
  - **Depends On:** T-015, T-016
  - **Guard:** Before archiving, query `Project` collection for `{ clientId, status: { $ne: 'completed' }, isArchived: false }`. Return 400 if any exist.

---

- [x] **T-018 — Client Controller & Routes**
  - **Description:** Wire up 5 client endpoints. All routes protected by `protect` middleware. Scope all queries by `req.user._id` (freelancerId) so freelancers can only see their own clients.
  - **Files to create/modify:** `src/modules/clients/client.controller.js`, `src/modules/clients/client.routes.js`, `src/app.js`
  - **Depends On:** T-017
  - **Routes:** `GET /clients`, `POST /clients`, `GET /clients/:id`, `PUT /clients/:id`, `DELETE /clients/:id`

---

- [x] **T-019 — Client Ownership Guard Middleware**
  - **Description:** Create a reusable `checkOwnership(Model)` middleware factory that fetches a resource by `req.params.id`, verifies `resource.freelancerId === req.user._id`, and returns 403 if not. 404 if resource not found. Reuse this across all modules.
  - **Files to create:** `src/middleware/checkOwnership.js`
  - **Depends On:** T-010

---

- [x] **T-020 — Client API Manual Test**
  - **Description:** Test all 5 client endpoints end-to-end using a REST client (Postman / `.http` file). Verify: auth required on all, email uniqueness enforced, archive blocks on active projects, pagination params work.
  - **Files to create:** `api-tests/clients.http`
  - **Depends On:** T-018, T-019

---

## Phase 4 — Project & Milestone API

> Goal: Full CRUD for projects linked to clients, and full milestone management within projects including the one-way completion flag.

---

- [x] **T-021 — Project Mongoose Model**
  - **Description:** Define the `Project` schema per PRD §6.3. Enum for `status` with values `not_started`, `in_progress`, `on_hold`, `completed`. Add `isArchived: false` default. Index `{ freelancerId: 1, clientId: 1 }`.
  - **Files to create:** `src/modules/projects/project.model.js`
  - **Depends On:** T-003

---

- [x] **T-022 — Project Validators**
  - **Description:** Validation chains for `createProject` (title required, clientId required + valid ObjectId, startDate required, deadline must be after startDate if provided) and `updateProject` (all optional, same date constraint).
  - **Files to create:** `src/modules/projects/project.validator.js`
  - **Depends On:** T-011

---

- [x] **T-023 — Project Service**
  - **Description:** Implement: `createProject` (verify client exists + belongs to freelancer), `getAllProjects` (paginated, filter by `status` and `clientId`), `getProjectById` (populate client, milestone count, invoice count), `updateProject` (enforce status transition rules; block edits on `completed` projects), `archiveProject`.
  - **Files to create:** `src/modules/projects/project.service.js`
  - **Depends On:** T-021, T-022, T-015
  - **Status rule:** `completed` is terminal — reject any status change away from it with 400.

---

- [x] **T-024 — Project Controller & Routes**
  - **Description:** Wire up 5 project endpoints. All scoped to `req.user._id`. Use `checkOwnership` for single-resource endpoints.
  - **Files to create/modify:** `src/modules/projects/project.controller.js`, `src/modules/projects/project.routes.js`, `src/app.js`
  - **Depends On:** T-023, T-019

---

- [x] **T-025 — Milestone Mongoose Model**
  - **Description:** Define the `Milestone` schema per PRD §6.4. `isCompleted: false` default. `completedAt` is null by default, set server-side. Index `{ projectId: 1 }` for fast milestone list queries.
  - **Files to create:** `src/modules/milestones/milestone.model.js`
  - **Depends On:** T-003

---

- [x] **T-026 — Milestone Validators**
  - **Description:** Validation for `createMilestone` (title required, amount must be non-negative if provided, dueDate must be a valid date if provided) and `updateMilestone` (all optional, same rules).
  - **Files to create:** `src/modules/milestones/milestone.validator.js`
  - **Depends On:** T-011

---

- [x] **T-027 — Milestone Service**
  - **Description:** Implement: `createMilestone` (verify project exists, is not completed or archived, belongs to freelancer), `getMilestonesForProject`, `getMilestoneById`, `updateMilestone` (block if `isCompleted: true`), `completeMilestone` (set `isCompleted: true`, `completedAt: new Date()`; one-way only), `deleteMilestone` (block if completed).
  - **Files to create:** `src/modules/milestones/milestone.service.js`
  - **Depends On:** T-025, T-026, T-021
  - **Guard:** `PATCH /complete` sets the flag; any future request attempting to set `isCompleted: false` returns 400 `MILESTONE_ALREADY_COMPLETE`.

---

- [x] **T-028 — Milestone Controller & Routes**
  - **Description:** Wire up 6 milestone endpoints. Note nested routes: `GET/POST /projects/:projectId/milestones` and individual `GET/PUT/PATCH/DELETE /milestones/:id`.
  - **Files to create/modify:** `src/modules/milestones/milestone.controller.js`, `src/modules/milestones/milestone.routes.js`, `src/app.js`
  - **Depends On:** T-027, T-019

---

- [x] **T-029 — Invoice Number Counter Model**
  - **Description:** Create a `Counter` Mongoose model with `{ freelancerId, year, seq }` and a unique index on `{ freelancerId, year }`. Add a static method `nextInvoiceNumber(freelancerId)` that atomically increments `seq` with `findOneAndUpdate + $inc + upsert: true` and returns the formatted string `FF-{YEAR}-{SEQ padded to 4 digits}`.
  - **Files to create:** `src/utils/invoiceNumber.js`
  - **Depends On:** T-003
  - **Example output:** `FF-2026-0001`

---

- [x] **T-030 — Project & Milestone API Manual Test**
  - **Description:** Test all project and milestone endpoints. Verify: project links to valid client, `completed` status is terminal, milestone completion is one-way, delete blocks on completed milestones.
  - **Files to create:** `api-tests/projects.http`, `api-tests/milestones.http`
  - **Depends On:** T-028, T-024

---

## Phase 5 — Invoice API

> Goal: Invoices created with auto-generated numbers, correct computed totals, status workflow enforced, PDF generated on demand, and invoice emailed to client.

---

- [x] **T-031 — Invoice Mongoose Model**
  - **Description:** Define the `Invoice` schema per PRD §6.5. `lineItems` is an array of subdocuments `{ description, quantity, unitPrice, total }`. `status` enum: `draft`, `sent`, `partially_paid`, `paid`, `overdue`. `amountPaid` defaults to 0. Index `{ freelancerId: 1, status: 1 }` for cron queries.
  - **Files to create:** `src/modules/invoices/invoice.model.js`
  - **Depends On:** T-003

---

- [x] **T-032 — Invoice Validators**
  - **Description:** Validation for `createInvoice`: `projectId` required + valid ObjectId, `dueDate` required + must be in the future, `lineItems` array must have at least 1 item if `autoPopulate` is false, each line item needs `description` and `unitPrice > 0`, `taxRate` must be 0–100 if provided.
  - **Files to create:** `src/modules/invoices/invoice.validator.js`
  - **Depends On:** T-011

---

- [x] **T-033 — Invoice Service: Create**
  - **Description:** Implement `createInvoice`: verify project exists + belongs to freelancer; if `autoPopulate: true`, fetch completed milestones and build `lineItems` from them; compute `subtotal`, `taxAmount`, `totalAmount`; call `nextInvoiceNumber()`; block creation if an unpaid invoice already exists for this project (status not `paid`).
  - **Files to create/modify:** `src/modules/invoices/invoice.service.js`
  - **Depends On:** T-031, T-032, T-029, T-025
  - **Guard:** `Invoice.findOne({ projectId, status: { $in: ['draft','sent','partially_paid','overdue'] } })` → 409 if found.

---

- [x] **T-034 — Invoice Service: Read & Update**
  - **Description:** Implement `getAllInvoices` (paginated, filter by `status`, `clientId`; populate client and project names), `getInvoiceById` (full detail with `payments` sub-array), `updateInvoice` (only allowed when `status === 'draft'`; recompute totals on save), `updateInvoiceStatus` (manual status patch with validation).
  - **Files to create/modify:** `src/modules/invoices/invoice.service.js`
  - **Depends On:** T-033

---

- [x] **T-035 — PDF Generation Service**
  - **Description:** Implement `generateInvoicePDF(invoice, freelancer, client)` using `pdfkit`. Returns a Buffer (not a file on disk). PDF must include: freelancer header (name, business, contact), client block, invoice metadata (number, dates), line items table, subtotal / tax / total rows, payment notes footer.
  - **Files to create:** `src/modules/invoices/invoice.pdf.js`
  - **Depends On:** T-031
  - **Key:** `pdfkit` streams to a `PassThrough` or collected into a Buffer via `getContents()` for email attachment reuse.

---

- [x] **T-036 — Invoice PDF Endpoint**
  - **Description:** Implement `GET /invoices/:id/pdf`. Fetches invoice, populates freelancer and client data, calls `generateInvoicePDF()`, pipes buffer to response with headers `Content-Type: application/pdf` and `Content-Disposition: attachment; filename=FF-2026-0042.pdf`.
  - **Files to create/modify:** `src/modules/invoices/invoice.controller.js`
  - **Depends On:** T-035, T-034

---

- [x] **T-037 — Email Utility (Nodemailer)**
  - **Description:** Create a reusable `sendEmail({ to, subject, html, attachments })` function using Nodemailer. Configure transporter from env vars (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`). Support buffer attachments for PDF. Log success/failure but don't crash the server on email error.
  - **Files to create:** `src/utils/email.js`
  - **Depends On:** T-002
  - **Transporter:** `createTransport({ host, port, secure, auth })`. For Gmail: use App Password.

---

- [x] **T-038 — Invoice Email Service & Endpoint**
  - **Description:** Implement `POST /invoices/:id/send`. Generate the PDF buffer, build an HTML email body with invoice summary, send via `sendEmail()` with PDF attached, update invoice `status → 'sent'` and `sentAt = new Date()`. Return 200 with confirmation message.
  - **Files to create/modify:** `src/modules/invoices/invoice.service.js`, `src/modules/invoices/invoice.controller.js`
  - **Depends On:** T-036, T-037
  - **Guard:** Allow re-send (don't block if already `sent`). Block only if `status === 'paid'`.

---

- [x] **T-039 — Invoice Controller & Routes**
  - **Description:** Wire up all 7 invoice endpoints. Protect all with `protect` + `checkOwnership`. Ensure `PUT` blocks edits on non-draft invoices.
  - **Files to create/modify:** `src/modules/invoices/invoice.controller.js`, `src/modules/invoices/invoice.routes.js`, `src/app.js`
  - **Depends On:** T-038

---

- [x] **T-040 — Invoice API Manual Test**
  - **Description:** End-to-end test: create invoice with manual line items, create with `autoPopulate: true` from milestones, download PDF (verify it opens), send email (verify arrives in inbox), attempt edit on sent invoice (expect 400).
  - **Files to create:** `api-tests/invoices.http`
  - **Depends On:** T-039

---

## Phase 6 — Payment API

> Goal: Payments recorded against invoices with running totals. Invoice auto-transitions to `paid` when fully settled.

---

- [x] **T-041 — Payment Mongoose Model**
  - **Description:** Define the `Payment` schema per PRD §6.6. `method` enum: `bank_transfer`, `upi`, `cash`, `paypal`, `other`. Index `{ invoiceId: 1 }` for fast payment list queries.
  - **Files to create:** `src/modules/payments/payment.model.js`
  - **Depends On:** T-003

---

- [x] **T-042 — Payment Validators**
  - **Description:** Validation for `createPayment`: `amount` required + must be `> 0`, `method` required + must be valid enum, `date` required + must not be in the future.
  - **Files to create:** `src/modules/payments/payment.validator.js`
  - **Depends On:** T-011

---

- [x] **T-043 — Payment Service**
  - **Description:** Implement `recordPayment`: fetch invoice, validate `amount <= (totalAmount - amountPaid)` (no overpayment), create Payment record, update `invoice.amountPaid += amount`, if `amountPaid >= totalAmount` set `status → 'paid'` and `paidAt = new Date()` else set `status → 'partially_paid'`. All in one atomic-ish sequence (no transactions on Atlas free tier). Implement `getPaymentsForInvoice`, `getPaymentById`, `deletePayment` (reverse `amountPaid` on invoice, revert status).
  - **Files to create:** `src/modules/payments/payment.service.js`
  - **Depends On:** T-041, T-042, T-031
  - **Guard:** Block `recordPayment` if `invoice.status === 'paid'`.

---

- [x] **T-044 — Payment Controller, Routes & Test**
  - **Description:** Wire up 4 payment endpoints. Test: record partial payment (expect `partially_paid`), record remaining amount (expect `paid`), attempt payment on paid invoice (expect 400), delete payment (expect status revert).
  - **Files to create/modify:** `src/modules/payments/payment.controller.js`, `src/modules/payments/payment.routes.js`, `src/app.js`
  - **Files to create:** `api-tests/payments.http`
  - **Depends On:** T-043

---

## Phase 7 — Automation (Cron Job + Overdue Emails)

> Goal: Daily scheduled job finds overdue invoices, marks them, and sends one email reminder per invoice. No manual trigger required.

---

- [x] **T-045 — Overdue Detection Cron Job**
  - **Description:** Implement the `node-cron` job in `src/jobs/overdue.job.js`. Schedule: `"5 0 * * *"` (00:05 daily). Query: `Invoice.find({ dueDate: { $lt: new Date() }, status: { $in: ['sent', 'partially_paid'] } })`. Bulk-update matched invoices to `status: 'overdue'`. Return updated invoice list for email dispatch.
  - **Files to create:** `src/jobs/overdue.job.js`
  - **Depends On:** T-031
  - **Idempotency:** Only invoices transitioning to `overdue` for the first time get emailed — already-overdue invoices are excluded by the query.

---

- [x] **T-046 — Overdue Reminder Email Template**
  - **Description:** Create an HTML email template function `buildOverdueEmail({ invoiceNumber, clientName, totalAmount, amountPaid, dueDate, currency })` that returns a professional HTML string. Tone: firm but polite. Include outstanding amount, original due date, and call to action.
  - **Files to create/modify:** `src/utils/email.js`
  - **Depends On:** T-037

---

- [x] **T-047 — Cron Job: Email Dispatch**
  - **Description:** After marking invoices overdue, iterate through each and call `sendEmail()` with the overdue template and the client's email address (populated from Client model). Log success/failure per invoice. A single email failure must not stop the rest from being processed (use `Promise.allSettled`).
  - **Files to create/modify:** `src/jobs/overdue.job.js`
  - **Depends On:** T-045, T-046

---

- [x] **T-048 — Register Cron Job on Server Start**
  - **Description:** Import and initialize the cron job in `server.js` after the DB connection is established. Log job registration on startup.
  - **Files to create/modify:** `server.js`
  - **Depends On:** T-047

---

- [x] **T-049 — Cron Job Test Endpoint (Dev Only)**
  - **Description:** Create a dev-only `POST /api/v1/dev/trigger-overdue` route (disabled in production via `NODE_ENV` check) that manually triggers the overdue job. This allows demonstrating the cron behavior without waiting for midnight.
  - **Files to create:** `src/modules/dev/dev.routes.js`
  - **Depends On:** T-048
  - **Guard:** `if (process.env.NODE_ENV === 'production') return res.status(404).json({ message: 'Not found' });`

---

## Phase 8 — Dashboard API

> Goal: Single endpoint returns aggregated business metrics using MongoDB aggregation pipeline.

---

- [x] **T-050 — Dashboard Aggregation Service**
  - **Description:** Implement `getDashboardStats(freelancerId)` using MongoDB aggregation pipelines. Compute in parallel using `Promise.all`: total clients (active), active projects count, completed projects count, total invoiced (sum of all `totalAmount`), total paid (sum of `amountPaid`), overdue invoice count, and last 5 invoices with client names.
  - **Files to create:** `src/modules/dashboard/dashboard.service.js`
  - **Depends On:** T-015, T-021, T-031
  - **Performance:** Use `$facet` pipeline stage to compute multiple stats in a single DB round-trip where possible.

---

- [x] **T-051 — Dashboard Controller, Route & Test**
  - **Description:** Wire up `GET /api/v1/dashboard`. Protect with `protect`. Call service with `req.user._id`. Test: create sample data (clients, projects, invoices, payments) then verify all stats are correct.
  - **Files to create/modify:** `src/modules/dashboard/dashboard.controller.js`, `src/modules/dashboard/dashboard.routes.js`, `src/app.js`
  - **Files to create:** `api-tests/dashboard.http`
  - **Depends On:** T-050

---

## Phase 9 — Frontend (React + Tailwind)

> Goal: Minimal but functional UI that demos every backend feature. Not a polished product — a well-structured API demo interface.

---

- [x] **T-052 — Axios Client & Auth State**
  - **Description:** Configure the Axios instance with `baseURL` from env and a request interceptor that attaches the JWT from `localStorage` to every request. Create a simple auth context (`AuthContext`) with `login`, `logout`, and `user` state. Create a `ProtectedRoute` component.
  - **Files to create:** `src/api/axios.js`, `src/context/AuthContext.jsx`, `src/components/ProtectedRoute.jsx`
  - **Depends On:** T-008, T-013

---

- [x] **T-053 — Auth Pages (Login + Register)**
  - **Description:** Build `LoginPage` and `RegisterPage` with controlled forms. On success, store JWT in `localStorage`, update `AuthContext`, redirect to `/dashboard`. Show inline error messages from API. Add a top-level `Navbar` component with logout.
  - **Files to create:** `src/pages/LoginPage.jsx`, `src/pages/RegisterPage.jsx`, `src/components/Navbar.jsx`
  - **Depends On:** T-052

---

- [x] **T-054 — Dashboard Page + Client & Project Pages**
  - **Description:** Build 3 pages: `DashboardPage` (display stats from `/dashboard` in stat cards), `ClientsPage` (list with create form + archive button), `ProjectsPage` (list filtered by status, create form linked to a client, status update dropdown).
  - **Files to create:** `src/pages/DashboardPage.jsx`, `src/pages/ClientsPage.jsx`, `src/pages/ProjectsPage.jsx`
  - **Depends On:** T-053, T-051, T-018, T-024

---

- [x] **T-055 — Project Detail Page (Milestones)**
  - **Description:** Build `ProjectDetailPage` showing project info, a list of milestones with their status, a form to add a new milestone, and a "Mark Complete" button per milestone. Show a visual completion indicator (e.g., progress bar based on completed milestone count).
  - **Files to create:** `src/pages/ProjectDetailPage.jsx`
  - **Depends On:** T-054, T-028

---

- [x] **T-056 — Invoice Pages + Payment Recording**
  - **Description:** Build `InvoicesPage` (list with status badges, filter by status), `InvoiceDetailPage` (line items, payment history, "Download PDF" button → triggers `/pdf` endpoint, "Send Email" button, "Record Payment" form with amount + method). PDF download should open in new tab.
  - **Files to create:** `src/pages/InvoicesPage.jsx`, `src/pages/InvoiceDetailPage.jsx`
  - **Depends On:** T-055, T-039, T-044

---

## Phase 10 — Deployment & Polish

> Goal: Backend live on Render, frontend live on Vercel, MongoDB on Atlas. Repo is clean and portfolio-ready.

---

- [x] **T-057 — Backend Deployment (Render)**
  - **Description:** Deploy backend to Render Web Service. Set all environment variables in Render dashboard (`MONGODB_URI`, `JWT_SECRET`, `SMTP_*`, `NODE_ENV=production`, `FRONTEND_URL`). Verify: `/api/v1/auth/register` responds from the public Render URL. Update CORS origin to Vercel URL.
  - **Files to create/modify:** `render.yaml` (optional), `src/app.js` (CORS config)
  - **Depends On:** T-048, T-051
  - **Checklist:** `NODE_ENV=production` set ✓, no `.env` file committed ✓, `start` script in `package.json` ✓

---

- [x] **T-058 — Frontend Deployment + Repo Polish**
  - **Description:** Deploy frontend to Vercel with `VITE_API_BASE_URL` set to Render backend URL. Then polish the repo: write `README.md` (setup, env vars, deploy guide), add `api-tests/FreelanceFlow.http` master collection, verify `.gitignore` covers all sensitive files, add `.env.example` with placeholder values.
  - **Files to create/modify:** `README.md`, `.env.example`, `api-tests/FreelanceFlow.http`
  - **Depends On:** T-056, T-057
  - **README sections:** Project overview, tech stack, local setup (step-by-step), env vars table, deploy guide, demo walkthrough, cron trigger instructions

---

## Milestone Checklist

These 5 milestones mark meaningful checkpoints. Celebrate each one — they represent real, working software.

---

- [x] **🏁 Milestone 1 — Server is Alive**
  > Express app running, connected to MongoDB Atlas, all folders in place, health check endpoint returns 200.  
  > **Tasks complete:** T-001 through T-008

---

- [x] **🔐 Milestone 2 — Auth Working End-to-End**
  > Freelancer can register, log in, receive a JWT, and access a protected route. Unauthenticated requests are rejected with 401.  
  > **Tasks complete:** T-009 through T-014

---

- [x] **📋 Milestone 3 — Full Project Lifecycle Working**
  > Can create a client, create a project under that client, add milestones, and mark them complete — all via authenticated API calls. Pagination and filtering work on list endpoints.  
  > **Tasks complete:** T-015 through T-030

---

- [x] **📄 Milestone 4 — First Invoice PDF Generated and Emailed**
  > Invoice created from milestone data, PDF downloaded and opens correctly, email with PDF attachment arrives in client inbox. Payment recorded and invoice auto-marks as paid.  
  > **Tasks complete:** T-031 through T-044

---

- [x] **🚀 Milestone 5 — Fully Deployed and Portfolio-Ready**
  > Backend on Render, frontend on Vercel, cron job registered and demo-triggerable, README complete, all API tests passing against production URLs.  
  > **Tasks complete:** T-045 through T-058

---

*End of TASKS.md*  
*Next document to generate: `FOLDER_STRUCTURE.md` → then `API_CONTRACTS.md` → then `SCHEMAS.md`*