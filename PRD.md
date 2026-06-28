# FreelanceFlow — Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** 2026-06-28  
**Author:** Product & Architecture Team  
**Status:** Draft — Ready for Development

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [User Roles & Permissions](#2-user-roles--permissions)
3. [Core Features & Priorities](#3-core-features--priorities)
4. [Functional Requirements](#4-functional-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Data Models Overview](#6-data-models-overview)
7. [API Surface Overview](#7-api-surface-overview)
8. [Out of Scope](#8-out-of-scope)
9. [Success Criteria](#9-success-criteria)

---

## 1. Project Overview

### 1.1 Problem Statement

Freelancers today are forced to choose between two painful extremes:

- **Bloated SaaS tools** (FreshBooks, HoneyBook, Bonsai) — expensive subscriptions, unnecessary features, poor customization, and vendor lock-in.
- **Manual spreadsheets / Google Docs** — error-prone, no automation, no audit trail, and embarrassing when shared with clients.

The result: missed invoices, forgotten follow-ups, unclear project statuses, and lost money. Freelancers spend hours on administrative overhead that should be automated.

### 1.2 Solution

**FreelanceFlow** is a self-hosted, backend-focused MERN stack web application that gives a freelancer everything they need to run their business — client management, project tracking, milestone-based billing, invoice generation, and payment recording — in a single lightweight tool they own and control.

The product is deliberately backend-heavy. The frontend is a clean, functional React + Tailwind UI that demonstrates every API capability — not a polished consumer product. The value is in the API, the automation, and the data model.

### 1.3 Goals

| # | Goal | Type |
|---|------|------|
| G1 | Replace spreadsheets and manual invoicing for a solo freelancer | Core |
| G2 | Generate PDF invoices automatically and email them to clients | Core |
| G3 | Auto-detect overdue invoices and send reminder emails without manual input | Core |
| G4 | Provide a clear, milestone-based view of every active project | Core |
| G5 | Demonstrate a production-quality REST API suitable for a portfolio | Portfolio |
| G6 | Deploy fully to free-tier cloud infrastructure (Render + Vercel + Atlas) | Constraint |

### 1.4 Non-Goals (Summary)

- This is not a multi-tenant SaaS platform.
- This is not a client-facing portal (clients do not log in).
- This is not a time-tracking or timesheet tool.

---

## 2. User Roles & Permissions

### 2.1 Role Definitions

**Freelancer** — The sole authenticated user of the system. Has full CRUD access to all resources. Manages their own clients, projects, invoices, and payments.

**Client** — A data entity (record in the database), not an authenticated user. Clients receive emails (invoices, reminders) but cannot log into the system. All client-facing actions are performed by the Freelancer on the client's behalf.

> Note: Future versions may introduce a read-only Client Portal role (see Out of Scope).

### 2.2 Permissions Table

| Action | Freelancer | Client (Entity) |
|--------|:----------:|:---------------:|
| Register / Login | ✅ | ❌ |
| Create / Edit / Delete Client | ✅ | ❌ |
| View all Clients | ✅ | ❌ |
| Create / Edit / Delete Project | ✅ | ❌ |
| View all Projects | ✅ | ❌ |
| Create / Edit / Delete Milestone | ✅ | ❌ |
| Mark Milestone complete | ✅ | ❌ |
| Create / Edit Invoice | ✅ | ❌ |
| Download Invoice PDF | ✅ | ❌ (receives via email) |
| Send Invoice via Email | ✅ | ❌ |
| Mark Invoice paid | ✅ | ❌ |
| Record Payment | ✅ | ❌ |
| View Payment history | ✅ | ❌ |
| Receive Invoice email | N/A | ✅ (email only) |
| Receive Reminder email | N/A | ✅ (email only) |

---

## 3. Core Features & Priorities

| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| F01 | JWT Authentication | **P0** | Register/login with hashed passwords, protected routes |
| F02 | Client Management | **P0** | Full CRUD for client records |
| F03 | Project Management | **P0** | Full CRUD for projects, linked to clients |
| F04 | Milestone Tracking | **P0** | Create milestones per project, mark complete |
| F05 | Invoice Generation | **P0** | Create invoices from project/milestones, store in DB |
| F06 | PDF Invoice Export | **P0** | Generate downloadable PDF using pdfkit |
| F07 | Invoice Email Delivery | **P0** | Send PDF invoice to client email via nodemailer |
| F08 | Payment Recording | **P0** | Log payments against invoices (partial/full) |
| F09 | Overdue Detection (cron) | **P0** | Auto-flag overdue invoices daily via node-cron |
| F10 | Overdue Email Reminder | **P0** | Auto-email clients when invoice becomes overdue |
| F11 | Dashboard Summary API | **P1** | Aggregated stats: revenue, active projects, overdue count |
| F12 | Invoice Status Workflow | **P1** | Status transitions: draft → sent → partially_paid → paid → overdue |
| F13 | Project Status Tracking | **P1** | Status: not_started → in_progress → on_hold → completed |
| F14 | Milestone-to-Invoice Link | **P1** | Auto-populate invoice line items from completed milestones |
| F15 | Soft Delete | **P1** | Archive clients/projects without hard deletion |
| F16 | Pagination & Filtering | **P1** | All list endpoints support pagination, sorting, status filter |
| F17 | Tax Rate on Invoice | **P2** | Configurable tax percentage added to invoice subtotal |
| F18 | Currency Selection | **P2** | Per-client or per-invoice currency setting |
| F19 | Activity Log | **P2** | Timestamped audit trail of key actions per project |

### Priority Legend

| Label | Meaning |
|-------|---------|
| **P0** | Must-have. MVP is incomplete without this. |
| **P1** | Should-have. Adds real value; include if time allows. |
| **P2** | Nice-to-have. Optional; implement last. |

---

## 4. Functional Requirements

### 4.1 Authentication (F01)

**What it does:** Allows the freelancer to create an account and authenticate. All other endpoints require a valid JWT.

| Aspect | Detail |
|--------|--------|
| **Inputs** | `email` (string, unique), `password` (string, min 8 chars) |
| **Outputs** | JWT access token (expires in 7 days), user object (id, name, email) |
| **Rules** | Passwords hashed with bcrypt (salt rounds: 12). No plain-text storage. JWT signed with `JWT_SECRET` from env. Token must be sent as `Authorization: Bearer <token>` on every protected request. |
| **Error cases** | 400 on missing fields; 409 on duplicate email; 401 on wrong credentials |

---

### 4.2 Client Management (F02)

**What it does:** The freelancer maintains a directory of clients. Each client has contact details and is the parent entity for projects.

| Aspect | Detail |
|--------|--------|
| **Inputs** | `name` (required), `email` (required, valid email), `phone` (optional), `company` (optional), `address` (optional), `notes` (optional) |
| **Outputs** | Client object with generated `_id`, `createdAt`, `updatedAt`, and `isArchived` flag |
| **Rules** | Email must be unique per freelancer. Deleting a client soft-deletes (sets `isArchived: true`). Cannot hard-delete a client with active (non-completed) projects. |
| **Constraints** | Max 1 client record per unique email address per freelancer account |

---

### 4.3 Project Management (F03)

**What it does:** Each project belongs to one client and represents a discrete engagement. Projects contain milestones and produce invoices.

| Aspect | Detail |
|--------|--------|
| **Inputs** | `title` (required), `clientId` (required, valid ObjectId), `description` (optional), `startDate` (required), `deadline` (optional), `totalBudget` (optional, number), `currency` (optional, default: "INR"), `status` (enum) |
| **Outputs** | Project object with linked client details (populated), milestone count, invoice count |
| **Rules** | `clientId` must reference an existing, non-archived client. `startDate` must not be after `deadline`. Status must follow the defined workflow: `not_started` → `in_progress` → `on_hold` → `completed`. |
| **Status transitions** | Any status can move to `on_hold`. `completed` is terminal (no further edits). |

---

### 4.4 Milestone Tracking (F04)

**What it does:** Milestones are checkpoints within a project, each representing a deliverable or phase with an optional payment amount tied to it.

| Aspect | Detail |
|--------|--------|
| **Inputs** | `title` (required), `projectId` (required), `dueDate` (optional), `amount` (optional, number — the billable value of this milestone), `description` (optional) |
| **Outputs** | Milestone object with `isCompleted` boolean and `completedAt` timestamp |
| **Rules** | `isCompleted` can only be set to `true`, never back to `false` (milestones are one-way). `completedAt` is auto-set by the server on completion. A milestone's `projectId` must reference a non-completed project. |
| **Constraints** | A milestone's `amount` cannot be negative. |

---

### 4.5 Invoice Generation (F05)

**What it does:** Creates an invoice record associated with a project and client. Line items can be added manually or auto-populated from completed milestones.

| Aspect | Detail |
|--------|--------|
| **Inputs** | `projectId` (required), `dueDate` (required), `lineItems` (array of `{description, quantity, unitPrice}`), `taxRate` (optional, %, default 0), `notes` (optional), `autoPopulate` (boolean flag — if true, pulls completed milestones as line items) |
| **Outputs** | Invoice object with computed `subtotal`, `taxAmount`, `totalAmount`, `status: "draft"`, and unique `invoiceNumber` |
| **Rules** | `invoiceNumber` auto-generated: `FF-{YEAR}-{SEQUENCE}` (e.g., `FF-2026-0042`). `totalAmount = subtotal + taxAmount`. `dueDate` must be in the future at time of creation. An invoice cannot be created for a project that already has an unpaid invoice. |
| **Status workflow** | `draft` → `sent` → `partially_paid` → `paid` → `overdue` (overdue set by cron only) |

---

### 4.6 PDF Invoice Export (F06)

**What it does:** Generates a professional PDF of a given invoice using pdfkit and streams/downloads it to the client browser.

| Aspect | Detail |
|--------|--------|
| **Inputs** | `invoiceId` (URL param) |
| **Outputs** | Binary PDF file stream, `Content-Type: application/pdf`, `Content-Disposition: attachment; filename=FF-2026-0042.pdf` |
| **PDF content** | Freelancer name + contact, client name + address, invoice number, issue date, due date, line items table, subtotal, tax, total, payment instructions, footer note |
| **Rules** | Invoice must exist and belong to the authenticated freelancer. PDF generated on-demand (not stored on disk). |

---

### 4.7 Invoice Email Delivery (F07)

**What it does:** Sends the PDF invoice as an email attachment to the client's email address.

| Aspect | Detail |
|--------|--------|
| **Inputs** | `invoiceId` (URL param), optional `customMessage` (string) in body |
| **Outputs** | 200 OK with `{ message: "Invoice sent to client@email.com" }`. Invoice `status` updated to `"sent"`, `sentAt` timestamp recorded. |
| **Rules** | Email sent via nodemailer using SMTP credentials from env (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`). Invoice must be in `draft` or `sent` status (re-send allowed). PDF generated fresh at send time. |
| **Email content** | Subject: `Invoice #FF-2026-0042 from [Freelancer Name]`, body with professional HTML template, PDF attachment |

---

### 4.8 Payment Recording (F08)

**What it does:** Records a payment against an invoice. Supports partial payments (multiple payment records per invoice).

| Aspect | Detail |
|--------|--------|
| **Inputs** | `invoiceId` (required), `amount` (required, number > 0), `method` (enum: `bank_transfer`, `upi`, `cash`, `paypal`, `other`), `date` (required), `notes` (optional) |
| **Outputs** | Payment record object. Invoice `amountPaid` updated. Invoice `status` auto-updated: if `amountPaid >= totalAmount`, status → `paid`; else status → `partially_paid`. |
| **Rules** | Payment `amount` cannot exceed `totalAmount - amountPaid` (no overpayment). Payment `date` cannot be in the future. A `paid` invoice cannot receive additional payments. |

---

### 4.9 Overdue Detection via Cron (F09 + F10)

**What it does:** A scheduled background job runs daily at midnight. It finds all invoices where `dueDate < today` and `status` is `sent` or `partially_paid`, marks them `overdue`, and sends a reminder email to the client.

| Aspect | Detail |
|--------|--------|
| **Schedule** | Daily at 00:05 server time (`node-cron`: `"5 0 * * *"`) |
| **Logic** | Query: `{ dueDate: { $lt: new Date() }, status: { $in: ["sent", "partially_paid"] } }` |
| **Actions** | 1. Bulk update status to `"overdue"`. 2. For each affected invoice, send reminder email to client. |
| **Email content** | Subject: `Overdue: Invoice #FF-2026-0042 — Payment Required`, body with outstanding amount and due date, gentle call to action |
| **Idempotency** | Already-overdue invoices are not re-emailed. Only status transitions trigger email. |
| **Logging** | Cron job logs start time, number of invoices processed, and any email failures to server console. |

---

### 4.10 Dashboard Summary API (F11)

**What it does:** Returns aggregated business stats for the authenticated freelancer in a single API call, suitable for rendering a dashboard.

| Aspect | Detail |
|--------|--------|
| **Inputs** | None (uses auth JWT to scope data) |
| **Outputs** | JSON object with: `totalClients`, `activeProjects`, `completedProjects`, `totalInvoiced` (sum), `totalPaid` (sum), `totalOutstanding` (sum), `overdueInvoicesCount`, `recentInvoices` (last 5) |
| **Rules** | All aggregations scoped to the authenticated freelancer. Computed using MongoDB aggregation pipeline for performance. Response cached in-memory for 60 seconds to avoid repeated heavy queries. |

---

## 5. Non-Functional Requirements

### 5.1 Security

| Requirement | Implementation |
|-------------|---------------|
| All routes protected by JWT | `authMiddleware.js` applied globally; only `/auth/register` and `/auth/login` are public |
| Passwords never stored in plain text | bcrypt with 12 salt rounds |
| No sensitive data in JWT payload | JWT contains only `{ userId, email }`; no role or financial data |
| Environment variables for all secrets | `JWT_SECRET`, `SMTP_*`, `MONGODB_URI` loaded via `dotenv`; never committed to git |
| MongoDB injection prevention | Mongoose schema validation; all user inputs cast to schema types before query |
| CORS configured | Only allow requests from the deployed Vercel frontend URL in production |
| Rate limiting | `express-rate-limit` on `/auth/*` routes: max 10 requests per 15 minutes per IP |

### 5.2 Error Handling Standards

All API errors must follow this response shape:

```json
{
  "success": false,
  "error": {
    "code": "INVOICE_NOT_FOUND",
    "message": "Invoice with ID xyz does not exist.",
    "field": "invoiceId"
  }
}
```

| HTTP Code | When to use |
|-----------|-------------|
| 200 | Successful GET / PUT / PATCH |
| 201 | Successful POST (resource created) |
| 400 | Validation error, malformed input, business rule violation |
| 401 | Missing or invalid JWT token |
| 403 | Valid token, but resource does not belong to this user |
| 404 | Resource not found |
| 409 | Conflict (duplicate email, invoice already exists) |
| 500 | Unhandled server errors (log stack trace, return generic message) |

### 5.3 Scalability

- All list endpoints support `?page=1&limit=10&sort=createdAt&order=desc` query parameters.
- MongoDB Atlas free tier (M0) has a 512MB limit — schemas must be lean. No storing PDF binaries in the DB.
- Connection pooling via Mongoose defaults (max 5 connections on free tier).
- Stateless API: no session storage; horizontal scaling possible in future.

### 5.4 Code Quality & Maintainability

- Project structured using feature-based folders (not MVC monolith).
- All business logic in `services/` layer, not in route handlers.
- Every route handler wrapped in `asyncHandler` utility to avoid try-catch repetition.
- Validation using `express-validator` or `joi` on all POST/PUT bodies.
- `console.error` for errors in development; structured logging ready for production.

### 5.5 Deployment Constraints

| Service | Platform | Tier |
|---------|----------|------|
| Backend API | Render | Free (spins down after 15 min inactivity) |
| Frontend | Vercel | Free (Hobby) |
| Database | MongoDB Atlas | M0 Free Cluster |
| SMTP | Gmail (App Password) or Mailtrap | Free |

> **Note:** Render free tier services sleep after inactivity. The cron job will not fire unless the service is awake. Acceptable for portfolio/demo purposes. A P2 enhancement could use an external cron service (e.g., cron-job.org) to ping the server and keep it warm.

---

## 6. Data Models Overview

### 6.1 User

Represents the freelancer — the single authenticated actor in the system.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | Auto | MongoDB default |
| `name` | String | Yes | Freelancer's display name |
| `email` | String | Yes | Unique; used for login |
| `passwordHash` | String | Yes | bcrypt hash; never returned in API responses |
| `businessName` | String | No | Used in invoice PDF header |
| `phone` | String | No | Used in invoice PDF header |
| `address` | String | No | Used in invoice PDF |
| `createdAt` | Date | Auto | Mongoose timestamps |
| `updatedAt` | Date | Auto | Mongoose timestamps |

### 6.2 Client

A contact/company the freelancer works with.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | Auto | |
| `freelancerId` | ObjectId (ref: User) | Yes | Scopes client to authenticated user |
| `name` | String | Yes | |
| `email` | String | Yes | Unique per freelancer; used for invoice emails |
| `phone` | String | No | |
| `company` | String | No | |
| `address` | String | No | Appears on invoice |
| `notes` | String | No | Private freelancer notes |
| `isArchived` | Boolean | Yes | Default: false; soft delete |
| `createdAt` | Date | Auto | |
| `updatedAt` | Date | Auto | |

### 6.3 Project

A scoped engagement between the freelancer and a client.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | Auto | |
| `freelancerId` | ObjectId (ref: User) | Yes | |
| `clientId` | ObjectId (ref: Client) | Yes | |
| `title` | String | Yes | |
| `description` | String | No | |
| `status` | Enum | Yes | `not_started`, `in_progress`, `on_hold`, `completed` |
| `startDate` | Date | Yes | |
| `deadline` | Date | No | |
| `totalBudget` | Number | No | Informational; not enforced |
| `currency` | String | Yes | Default: `"INR"` |
| `isArchived` | Boolean | Yes | Default: false |
| `createdAt` | Date | Auto | |
| `updatedAt` | Date | Auto | |

### 6.4 Milestone

A checkpoint or deliverable within a project.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | Auto | |
| `projectId` | ObjectId (ref: Project) | Yes | |
| `freelancerId` | ObjectId (ref: User) | Yes | Denormalized for query performance |
| `title` | String | Yes | |
| `description` | String | No | |
| `dueDate` | Date | No | |
| `amount` | Number | No | Billable value of this milestone |
| `isCompleted` | Boolean | Yes | Default: false; one-way flag |
| `completedAt` | Date | No | Set server-side on completion |
| `createdAt` | Date | Auto | |
| `updatedAt` | Date | Auto | |

### 6.5 Invoice

A billing document issued to a client for a project.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | Auto | |
| `invoiceNumber` | String | Yes | Auto-generated: `FF-{YEAR}-{SEQ}` |
| `freelancerId` | ObjectId (ref: User) | Yes | |
| `clientId` | ObjectId (ref: Client) | Yes | |
| `projectId` | ObjectId (ref: Project) | Yes | |
| `lineItems` | Array | Yes | `[{ description, quantity, unitPrice, total }]` |
| `subtotal` | Number | Yes | Computed: sum of line item totals |
| `taxRate` | Number | Yes | Default: 0 (percentage) |
| `taxAmount` | Number | Yes | Computed: `subtotal * (taxRate / 100)` |
| `totalAmount` | Number | Yes | Computed: `subtotal + taxAmount` |
| `amountPaid` | Number | Yes | Running total of recorded payments; default: 0 |
| `status` | Enum | Yes | `draft`, `sent`, `partially_paid`, `paid`, `overdue` |
| `dueDate` | Date | Yes | |
| `sentAt` | Date | No | Set when invoice is emailed |
| `paidAt` | Date | No | Set when status becomes `paid` |
| `notes` | String | No | Appears in invoice PDF footer |
| `createdAt` | Date | Auto | |
| `updatedAt` | Date | Auto | |

> **Invoice Sequence:** A separate `Counters` collection maintains a per-freelancer-per-year invoice sequence number, atomically incremented using `findOneAndUpdate` with `$inc`.

### 6.6 Payment

A payment record logged against an invoice.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | Auto | |
| `invoiceId` | ObjectId (ref: Invoice) | Yes | |
| `freelancerId` | ObjectId (ref: User) | Yes | |
| `amount` | Number | Yes | Must be > 0 |
| `method` | Enum | Yes | `bank_transfer`, `upi`, `cash`, `paypal`, `other` |
| `date` | Date | Yes | Date payment was received |
| `notes` | String | No | e.g., "UTR: 12345678" |
| `createdAt` | Date | Auto | |

---

## 7. API Surface Overview

Base URL: `/api/v1`

All endpoints except `/auth/*` require `Authorization: Bearer <token>` header.

### 7.1 Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new freelancer account |
| POST | `/auth/login` | Login, receive JWT |
| GET | `/auth/me` | Get authenticated user profile |
| PUT | `/auth/me` | Update freelancer profile (name, businessName, etc.) |

### 7.2 Clients

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/clients` | List all clients (paginated, filterable by `isArchived`) |
| POST | `/clients` | Create a new client |
| GET | `/clients/:id` | Get a single client with project summary |
| PUT | `/clients/:id` | Update client details |
| DELETE | `/clients/:id` | Soft-delete client (archive) |

### 7.3 Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects` | List all projects (paginated, filter by status/clientId) |
| POST | `/projects` | Create a new project |
| GET | `/projects/:id` | Get project with milestones and invoices |
| PUT | `/projects/:id` | Update project details or status |
| DELETE | `/projects/:id` | Soft-delete project |

### 7.4 Milestones

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects/:projectId/milestones` | List milestones for a project |
| POST | `/projects/:projectId/milestones` | Create a milestone |
| GET | `/milestones/:id` | Get single milestone |
| PUT | `/milestones/:id` | Update milestone (title, due date, amount) |
| PATCH | `/milestones/:id/complete` | Mark milestone as completed |
| DELETE | `/milestones/:id` | Delete milestone (only if not completed) |

### 7.5 Invoices

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/invoices` | List all invoices (paginated, filter by status/clientId) |
| POST | `/invoices` | Create a new invoice |
| GET | `/invoices/:id` | Get invoice with full line items and payments |
| PUT | `/invoices/:id` | Update invoice (draft status only) |
| GET | `/invoices/:id/pdf` | Download invoice as PDF |
| POST | `/invoices/:id/send` | Email invoice PDF to client |
| PATCH | `/invoices/:id/status` | Manually update invoice status |

### 7.6 Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/invoices/:invoiceId/payments` | List payments for an invoice |
| POST | `/invoices/:invoiceId/payments` | Record a payment against an invoice |
| GET | `/payments/:id` | Get single payment record |
| DELETE | `/payments/:id` | Delete an incorrect payment record |

### 7.7 Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Get aggregated business summary stats |

---

## 8. Out of Scope

The following features are explicitly **not** being built in this version. They are logged here to prevent scope creep and to inform future roadmap decisions.

| Feature | Reason Out of Scope |
|---------|---------------------|
| Client portal / client login | Requires multi-role auth, significantly more UI work |
| Time tracking / timesheets | Different product category; no client demand stated |
| Recurring invoices / subscriptions | Complex scheduling; not needed for MVP |
| Contracts / e-signatures | Legal complexity; separate product (DocuSign, HelloSign) |
| Multi-currency exchange rates | Requires third-party FX API; P2 stretch goal only |
| Team / multi-user access | Single-freelancer tool by design |
| Mobile app | Web only for this version |
| Accounting software integration | QuickBooks, Xero, Tally out of scope |
| File/asset attachments | No file storage configured (no S3 / Cloudinary) |
| Project chat / comments | Communication tool out of scope |
| Real-time notifications (WebSockets) | Polling or cron-based is sufficient |
| Stripe / Razorpay payment processing | Payment gateway integration is V2 |
| Analytics dashboards (charts) | Backend aggregation only; no charting library |
| Admin panel / super-admin | Single-user system has no need |

---

## 9. Success Criteria

The project is considered **complete and impressive** when all P0 features are functional and the following criteria are met:

### 9.1 Functional Completeness

| Criterion | Pass Condition |
|-----------|---------------|
| Auth | JWT register/login works; all other routes reject requests without a valid token |
| Client CRUD | Create, read, update, soft-delete all work; email uniqueness enforced |
| Project CRUD | Full lifecycle from `not_started` to `completed`; linked to client |
| Milestone tracking | Can create milestones; marking complete sets timestamp and cannot be undone |
| Invoice creation | Invoice number auto-generated; totals computed correctly; status workflow enforced |
| PDF generation | `/invoices/:id/pdf` returns a valid, readable PDF with all expected fields |
| Email sending | Invoice email arrives in client inbox with PDF attached |
| Payment recording | Partial payments accumulate correctly; invoice auto-marks `paid` at full amount |
| Overdue cron | Invoices past due date are flagged `overdue` within 24 hours; reminder email sent once |
| Dashboard | `/dashboard` returns accurate aggregated stats with correct totals |

### 9.2 Code Quality

- No hardcoded secrets in source code (verified by a `.env.example` file in root).
- All routes use `authMiddleware`; no unprotected financial endpoints.
- API returns consistent error shapes (matching the schema in Section 5.2) for all error cases.
- Input validation present on all POST/PUT endpoints (400 returned on invalid input).

### 9.3 Deployment

- Backend deployed to Render and accessible via public URL.
- Frontend deployed to Vercel and can communicate with the Render backend.
- MongoDB Atlas cluster used for production data (not localhost).
- A Postman collection or REST client file is included in the repo to demo all endpoints.

### 9.4 Portfolio Impressiveness

- `README.md` explains the project, tech stack, how to run locally, and how to deploy.
- Repo is clean: `.gitignore` covers `node_modules`, `.env`, generated PDFs.
- At least one example of MongoDB aggregation pipeline used (dashboard endpoint).
- `node-cron` job is demonstrable (test endpoint or adjustable schedule for demo).
- Code is organized in feature-based structure, not a flat `routes/` + `models/` dump.

---

*End of Document*

**Next Steps:** Upon PRD approval, generate the following in order:
1. `TASK_BREAKDOWN.md` — sprint-style task list mapped to this PRD
2. `FOLDER_STRUCTURE.md` — complete project directory layout
3. `API_CONTRACTS.md` — full request/response spec for every endpoint
4. `SCHEMAS.md` — complete Mongoose schema definitions with validations