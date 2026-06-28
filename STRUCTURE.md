# FreelanceFlow — Project Folder & File Structure

**Version:** 1.0  
**Date:** 2026-06-28  
**Source:** Derived from PRD.md v1.0 + TASKS.md v1.0

> **Rule:** This document defines the canonical structure. Every file listed here must exist before coding begins — even if empty. AI coding tools must not create files outside this structure without updating this document first.

---

## Full Folder Tree

```
freelanceflow/
│
├── PRD.md                                  ← Product Requirements Document
├── TASKS.md                                ← Phased task breakdown with checkboxes
├── STRUCTURE.md                            ← This file
├── README.md                               ← Project overview, setup, and deploy guide
├── .gitignore                              ← Root-level gitignore (covers both workspaces)
│
├── backend/
│   ├── package.json                        ← Backend dependencies and npm scripts
│   ├── package-lock.json
│   ├── .env                                ← Local secrets (never committed)
│   ├── .env.example                        ← Env variable template with placeholder values
│   ├── .gitignore                          ← Backend-specific gitignore
│   ├── nodemon.json                        ← Nodemon config (watch src/, ignore tests/)
│   ├── server.js                           ← Entry point: connects DB, starts Express, registers cron
│   │
│   └── src/
│       │
│       ├── app.js                          ← Express app factory: mounts middleware and all routers
│       │
│       ├── config/
│       │   ├── db.js                       ← Mongoose connection logic with error handling
│       │   └── env.js                      ← Validates and exports all required env variables
│       │
│       ├── middleware/
│       │   ├── auth.js                     ← JWT protect middleware: verifies token, sets req.user
│       │   ├── asyncHandler.js             ← HOF wrapper to eliminate try-catch in controllers
│       │   ├── errorHandler.js             ← Global Express error handler (4-arg signature)
│       │   ├── validate.js                 ← Reads express-validator results, returns 400 on failure
│       │   └── checkOwnership.js           ← Factory middleware: verifies resource.freelancerId === req.user._id
│       │
│       ├── modules/
│       │   │
│       │   ├── auth/
│       │   │   ├── user.model.js           ← Mongoose User schema: fields, bcrypt pre-save hook, comparePassword()
│       │   │   ├── auth.validator.js       ← express-validator chains for register and login
│       │   │   ├── auth.service.js         ← Business logic: registerUser(), loginUser(), updateProfile()
│       │   │   ├── auth.controller.js      ← Route handlers: calls service, returns HTTP response
│       │   │   └── auth.routes.js          ← Express router: POST /register, POST /login, GET /me, PUT /me
│       │   │
│       │   ├── clients/
│       │   │   ├── client.model.js         ← Mongoose Client schema with compound unique index on {freelancerId, email}
│       │   │   ├── client.validator.js     ← Validation chains for createClient and updateClient
│       │   │   ├── client.service.js       ← CRUD logic: createClient(), getAllClients(), getClientById(), updateClient(), archiveClient()
│       │   │   ├── client.controller.js    ← Route handlers for all 5 client endpoints
│       │   │   └── client.routes.js        ← Express router: GET /, POST /, GET /:id, PUT /:id, DELETE /:id
│       │   │
│       │   ├── projects/
│       │   │   ├── project.model.js        ← Mongoose Project schema with status enum and isArchived flag
│       │   │   ├── project.validator.js    ← Validation chains: title, clientId ObjectId, date logic
│       │   │   ├── project.service.js      ← CRUD logic with status transition enforcement and client verification
│       │   │   ├── project.controller.js   ← Route handlers for all 5 project endpoints
│       │   │   └── project.routes.js       ← Express router: GET /, POST /, GET /:id, PUT /:id, DELETE /:id
│       │   │
│       │   ├── milestones/
│       │   │   ├── milestone.model.js      ← Mongoose Milestone schema: isCompleted one-way flag, completedAt timestamp
│       │   │   ├── milestone.validator.js  ← Validation chains: title, amount ≥ 0, valid dueDate
│       │   │   ├── milestone.service.js    ← CRUD + completeMilestone() with one-way guard, deleteMilestone() with completion guard
│       │   │   ├── milestone.controller.js ← Route handlers for all 6 milestone endpoints
│       │   │   └── milestone.routes.js     ← Router: nested under /projects/:projectId/milestones + standalone /milestones/:id routes
│       │   │
│       │   ├── invoices/
│       │   │   ├── invoice.model.js        ← Mongoose Invoice schema: lineItems subdoc array, status enum, amountPaid running total
│       │   │   ├── invoice.validator.js    ← Validation: projectId, dueDate future-check, lineItems array rules, taxRate 0–100
│       │   │   ├── invoice.service.js      ← createInvoice(), getAllInvoices(), getInvoiceById(), updateInvoice(), updateStatus(), sendInvoiceEmail()
│       │   │   ├── invoice.controller.js   ← Route handlers for all 7 invoice endpoints including PDF stream and email send
│       │   │   ├── invoice.routes.js       ← Router: CRUD + GET /:id/pdf + POST /:id/send + PATCH /:id/status
│       │   │   └── invoice.pdf.js          ← pdfkit PDF generation: generateInvoicePDF(invoice, freelancer, client) → Buffer
│       │   │
│       │   ├── payments/
│       │   │   ├── payment.model.js        ← Mongoose Payment schema: method enum, date, invoiceId ref
│       │   │   ├── payment.validator.js    ← Validation: amount > 0, method enum, date not in future
│       │   │   ├── payment.service.js      ← recordPayment() with overpayment guard + invoice status sync, getPayments(), deletePayment()
│       │   │   ├── payment.controller.js   ← Route handlers for all 4 payment endpoints
│       │   │   └── payment.routes.js       ← Router: nested under /invoices/:invoiceId/payments + standalone /payments/:id
│       │   │
│       │   ├── dashboard/
│       │   │   ├── dashboard.service.js    ← MongoDB aggregation pipelines: revenue totals, active projects, overdue count, recent invoices
│       │   │   ├── dashboard.controller.js ← Single route handler: calls service with req.user._id, returns stats object
│       │   │   └── dashboard.routes.js     ← Router: GET / (maps to GET /api/v1/dashboard)
│       │   │
│       │   └── dev/
│       │       └── dev.routes.js           ← Dev-only router: POST /trigger-overdue (disabled in production via NODE_ENV check)
│       │
│       ├── jobs/
│       │   └── overdue.job.js              ← node-cron job: schedule "5 0 * * *", query overdue invoices, update status, dispatch emails
│       │
│       └── utils/
│           ├── apiResponse.js              ← sendSuccess(res, data, code) and sendError(res, code, msg, field, status) helpers
│           ├── email.js                    ← Nodemailer transporter config + sendEmail({to, subject, html, attachments}) + email templates
│           └── invoiceNumber.js            ← Counter model + nextInvoiceNumber(freelancerId) → "FF-{YEAR}-{SEQ}" via atomic $inc
│
└── frontend/
    ├── package.json                        ← Frontend dependencies and Vite scripts
    ├── package-lock.json
    ├── .env                                ← VITE_API_BASE_URL (local, never committed)
    ├── .env.example                        ← Env template: VITE_API_BASE_URL=https://your-render-url.com
    ├── .gitignore                          ← Frontend-specific gitignore
    ├── index.html                          ← Vite entry HTML
    ├── vite.config.js                      ← Vite config with React plugin
    ├── tailwind.config.js                  ← Tailwind config: content paths, theme extensions
    ├── postcss.config.js                   ← PostCSS config required by Tailwind
    │
    └── src/
        ├── main.jsx                        ← React entry: renders <App /> into #root, wraps with providers
        ├── App.jsx                         ← Root component: React Router routes, ProtectedRoute wrappers
        ├── index.css                       ← Tailwind directives: @tailwind base/components/utilities
        │
        ├── api/
        │   └── axios.js                    ← Axios instance: baseURL from env, request interceptor attaches JWT from localStorage
        │
        ├── context/
        │   └── AuthContext.jsx             ← React context: user state, login(token), logout(), isAuthenticated — wraps entire app
        │
        ├── components/
        │   ├── Navbar.jsx                  ← Top navigation bar: app logo, nav links, logout button, user display name
        │   ├── ProtectedRoute.jsx          ← Route guard: redirects to /login if no valid token in AuthContext
        │   ├── Spinner.jsx                 ← Generic loading spinner component used during API calls
        │   ├── ErrorMessage.jsx            ← Displays API error messages in a styled banner
        │   ├── StatCard.jsx                ← Reusable stat card for dashboard: label + value + optional color accent
        │   ├── Badge.jsx                   ← Status badge component: maps status strings to color-coded pill labels
        │   ├── Modal.jsx                   ← Generic modal wrapper with backdrop: used for confirm dialogs and forms
        │   ├── Pagination.jsx              ← Pagination controls component: prev/next + page count display
        │   └── EmptyState.jsx              ← Empty list placeholder: icon + message + optional action button
        │
        └── pages/
            ├── LoginPage.jsx               ← Login form: email + password fields, calls POST /auth/login, stores JWT
            ├── RegisterPage.jsx            ← Register form: name + email + password, calls POST /auth/register
            ├── DashboardPage.jsx           ← Dashboard: fetches GET /dashboard, renders StatCards and recent invoice list
            ├── ClientsPage.jsx             ← Clients list with create form inline, archive button, pagination
            ├── ProjectsPage.jsx            ← Projects list: filter by status, create project form, status update dropdown
            ├── ProjectDetailPage.jsx       ← Single project: info header, milestone list, add milestone form, mark complete button
            ├── InvoicesPage.jsx            ← Invoices list: filter by status badges, link to detail, create invoice button
            └── InvoiceDetailPage.jsx       ← Invoice detail: line items table, payment history, download PDF, send email, record payment form
```

---

## File Purpose Index

A flat reference list of every file in the project, grouped by layer. Use this when you need to find where a specific piece of logic lives.

### Root Level

| File | Purpose |
|------|---------|
| `PRD.md` | Full product requirements document — source of truth for features, data models, and API surface |
| `TASKS.md` | Phased task breakdown with task IDs, dependencies, and checkboxes |
| `STRUCTURE.md` | This file — canonical folder structure and file purpose reference |
| `README.md` | Public-facing project doc: overview, tech stack, local setup, env vars, deployment steps |
| `.gitignore` | Root gitignore: covers both `backend/` and `frontend/` workspaces; excludes `node_modules`, `.env`, `*.pdf` |

---

### Backend — Entry & Config

| File | Purpose |
|------|---------|
| `backend/server.js` | Application entry point: loads env, connects to MongoDB, starts Express, registers cron job, listens on PORT |
| `backend/src/app.js` | Express application factory: applies all global middleware in order (helmet → cors → morgan → json → routes → errorHandler), mounts all module routers under `/api/v1` |
| `backend/src/config/db.js` | Mongoose `connect()` call using `MONGODB_URI` from env; logs success and fatal errors; exported as async `connectDB()` |
| `backend/src/config/env.js` | Reads and validates all required environment variables on startup; throws and exits if any required var is missing |
| `backend/.env.example` | Template listing every required env variable with descriptive placeholder values; committed to git |

---

### Backend — Middleware

| File | Purpose |
|------|---------|
| `backend/src/middleware/auth.js` | `protect` middleware: extracts `Bearer` token, calls `jwt.verify()`, loads user from DB, attaches to `req.user`; sends 401 on failure |
| `backend/src/middleware/asyncHandler.js` | Higher-order function wrapping async route handlers; forwards thrown errors to `next()` — eliminates all try-catch in controllers |
| `backend/src/middleware/errorHandler.js` | Global Express 4-argument error handler; maps Mongoose errors, JWT errors, and custom app errors to correct HTTP codes and standardized response shape |
| `backend/src/middleware/validate.js` | Reads `validationResult(req)` from `express-validator`; if errors exist, calls `next()` with a formatted 400 error; otherwise calls `next()` |
| `backend/src/middleware/checkOwnership.js` | Factory function `checkOwnership(Model)` returning middleware that fetches a resource by `req.params.id`, verifies `resource.freelancerId` matches `req.user._id`, and sends 403/404 accordingly |

---

### Backend — Auth Module

| File | Purpose |
|------|---------|
| `backend/src/modules/auth/user.model.js` | Mongoose `User` schema definition; bcrypt pre-save hook on `password` field; `comparePassword(candidate)` instance method; `passwordHash` excluded from default queries via `select: false` |
| `backend/src/modules/auth/auth.validator.js` | `express-validator` chain arrays: `registerValidators` (name, email, password min-8) and `loginValidators` (email, password) |
| `backend/src/modules/auth/auth.service.js` | `registerUser(data)`, `loginUser(email, password)`, `updateProfile(userId, data)` — pure business logic, no HTTP concerns |
| `backend/src/modules/auth/auth.controller.js` | `register`, `login`, `getMe`, `updateMe` — thin handlers that call service methods and use `sendSuccess()` / `sendError()` |
| `backend/src/modules/auth/auth.routes.js` | Express router mounting auth endpoints; rate limiter applied to `POST /register` and `POST /login`; `protect` applied to `GET /me` and `PUT /me` |

---

### Backend — Clients Module

| File | Purpose |
|------|---------|
| `backend/src/modules/clients/client.model.js` | Mongoose `Client` schema; compound unique index on `{ freelancerId, email }`; `isArchived: false` default; timestamps enabled |
| `backend/src/modules/clients/client.validator.js` | `createClientValidators` (name required, email required + valid) and `updateClientValidators` (all optional, email valid if present) |
| `backend/src/modules/clients/client.service.js` | `createClient()`, `getAllClients()` (paginated), `getClientById()` (with project count), `updateClient()`, `archiveClient()` (guards against active projects) |
| `backend/src/modules/clients/client.controller.js` | `createClient`, `getClients`, `getClient`, `updateClient`, `deleteClient` — all wrapped in `asyncHandler` |
| `backend/src/modules/clients/client.routes.js` | Express router; all routes protected with `protect`; single-resource routes use `checkOwnership(Client)` |

---

### Backend — Projects Module

| File | Purpose |
|------|---------|
| `backend/src/modules/projects/project.model.js` | Mongoose `Project` schema; `status` enum `['not_started','in_progress','on_hold','completed']`; index on `{ freelancerId, clientId }`; timestamps |
| `backend/src/modules/projects/project.validator.js` | `createProjectValidators` (title, clientId ObjectId, startDate required, deadline after startDate), `updateProjectValidators` (all optional, same date constraint) |
| `backend/src/modules/projects/project.service.js` | `createProject()` (verifies client ownership), `getAllProjects()` (paginated, filterable), `getProjectById()` (populated), `updateProject()` (status transition guard), `archiveProject()` |
| `backend/src/modules/projects/project.controller.js` | Five controller functions, each calling the corresponding service method |
| `backend/src/modules/projects/project.routes.js` | Express router for `/projects` resource; all protected; single-resource routes include `checkOwnership(Project)` |

---

### Backend — Milestones Module

| File | Purpose |
|------|---------|
| `backend/src/modules/milestones/milestone.model.js` | Mongoose `Milestone` schema; `isCompleted: false` default; `completedAt: null`; index on `{ projectId: 1 }` |
| `backend/src/modules/milestones/milestone.validator.js` | `createMilestoneValidators` (title required, amount ≥ 0, dueDate valid date), `updateMilestoneValidators` (all optional) |
| `backend/src/modules/milestones/milestone.service.js` | `createMilestone()` (verifies project not completed), `getMilestonesForProject()`, `getMilestoneById()`, `updateMilestone()` (blocks if completed), `completeMilestone()` (one-way setter), `deleteMilestone()` (blocks if completed) |
| `backend/src/modules/milestones/milestone.controller.js` | Six controller functions for all milestone endpoints |
| `backend/src/modules/milestones/milestone.routes.js` | Two route groups: nested `GET/POST /projects/:projectId/milestones` and standalone `GET/PUT/PATCH/DELETE /milestones/:id`; both mounted in `app.js` |

---

### Backend — Invoices Module

| File | Purpose |
|------|---------|
| `backend/src/modules/invoices/invoice.model.js` | Mongoose `Invoice` schema with `lineItems` subdoc array `{description, quantity, unitPrice, total}`, status enum, `amountPaid` field, `sentAt`, `paidAt` timestamps; index on `{ freelancerId, status }` |
| `backend/src/modules/invoices/invoice.validator.js` | Validators for create (projectId, dueDate future, lineItems array min-1, taxRate 0–100) and update (draft-only allowed fields) |
| `backend/src/modules/invoices/invoice.service.js` | `createInvoice()` (autoPopulate logic, total computation, duplicate guard), `getAllInvoices()`, `getInvoiceById()`, `updateInvoice()` (draft guard), `updateInvoiceStatus()`, `sendInvoiceEmail()` (generates PDF buffer, calls `sendEmail()`, updates sentAt) |
| `backend/src/modules/invoices/invoice.controller.js` | Seven handlers: CRUD + `downloadPDF` (pipes buffer to response) + `sendEmail` + `patchStatus` |
| `backend/src/modules/invoices/invoice.routes.js` | Express router for all 7 invoice endpoints including `/pdf` and `/send` sub-routes |
| `backend/src/modules/invoices/invoice.pdf.js` | `generateInvoicePDF(invoice, freelancer, client)`: builds PDF document using pdfkit, collects output into a Buffer, returns the Buffer for use in HTTP streaming and email attachments |

---

### Backend — Payments Module

| File | Purpose |
|------|---------|
| `backend/src/modules/payments/payment.model.js` | Mongoose `Payment` schema; `method` enum; index on `{ invoiceId: 1 }`; timestamps |
| `backend/src/modules/payments/payment.validator.js` | `createPaymentValidators`: amount > 0, method is valid enum value, date not in the future |
| `backend/src/modules/payments/payment.service.js` | `recordPayment()` (overpayment guard, `amountPaid` accumulation, invoice status auto-update), `getPaymentsForInvoice()`, `getPaymentById()`, `deletePayment()` (reverses amountPaid on invoice) |
| `backend/src/modules/payments/payment.controller.js` | Four handlers: list payments, record payment, get payment, delete payment |
| `backend/src/modules/payments/payment.routes.js` | Two route groups: `GET/POST /invoices/:invoiceId/payments` (nested) and `GET/DELETE /payments/:id` (standalone) |

---

### Backend — Dashboard Module

| File | Purpose |
|------|---------|
| `backend/src/modules/dashboard/dashboard.service.js` | `getDashboardStats(freelancerId)`: runs MongoDB `$facet` aggregation pipeline returning total clients, project counts by status, revenue totals, overdue count, and last 5 invoices |
| `backend/src/modules/dashboard/dashboard.controller.js` | Single `getStats` handler: calls service with `req.user._id`, returns result via `sendSuccess()` |
| `backend/src/modules/dashboard/dashboard.routes.js` | Express router: `GET /` (mounted at `/api/v1/dashboard`), protected with `protect` |

---

### Backend — Dev Module

| File | Purpose |
|------|---------|
| `backend/src/modules/dev/dev.routes.js` | Development-only Express router: `POST /trigger-overdue` manually invokes the overdue cron job; entire router is a no-op (returns 404) when `NODE_ENV === 'production'` |

---

### Backend — Jobs

| File | Purpose |
|------|---------|
| `backend/src/jobs/overdue.job.js` | Exports `registerOverdueJob()`: registers a `node-cron` task on schedule `"5 0 * * *"`; queries invoices with `dueDate < now` and `status in [sent, partially_paid]`; bulk updates to `overdue`; dispatches reminder emails via `sendEmail()` using `Promise.allSettled` |

---

### Backend — Utils

| File | Purpose |
|------|---------|
| `backend/src/utils/apiResponse.js` | `sendSuccess(res, data, statusCode=200)` and `sendError(res, code, message, field, statusCode)` — enforce the PRD §5.2 response shapes across all controllers |
| `backend/src/utils/email.js` | Nodemailer transporter configured from env; `sendEmail({to, subject, html, attachments})` exported function; HTML template functions: `buildInvoiceEmail(...)` and `buildOverdueEmail(...)` |
| `backend/src/utils/invoiceNumber.js` | `Counter` Mongoose model `{freelancerId, year, seq}`; `nextInvoiceNumber(freelancerId)` uses `findOneAndUpdate + $inc + upsert` for atomic sequence increment; formats result as `FF-YYYY-NNNN` |

---

### Frontend — Entry & Config

| File | Purpose |
|------|---------|
| `frontend/index.html` | Vite root HTML; contains `<div id="root">` and `<script type="module" src="/src/main.jsx">` |
| `frontend/vite.config.js` | Vite config: React plugin, optional proxy to backend for local dev (avoids CORS in development) |
| `frontend/tailwind.config.js` | Tailwind config: content array targeting `./src/**/*.{js,jsx}`, theme extensions (custom colors if any) |
| `frontend/postcss.config.js` | PostCSS config required by Tailwind: `tailwindcss` and `autoprefixer` plugins |
| `frontend/src/main.jsx` | React app entry: imports `AuthContext` provider, wraps `<App>` with `<BrowserRouter>`, renders into `#root` |
| `frontend/src/App.jsx` | Top-level route definitions using `react-router-dom`; wraps private routes with `<ProtectedRoute>`; defines public routes `/login` and `/register` |
| `frontend/src/index.css` | Global CSS: `@tailwind base; @tailwind components; @tailwind utilities;` — the only CSS file needed |

---

### Frontend — API Layer

| File | Purpose |
|------|---------|
| `frontend/src/api/axios.js` | Configured Axios instance: `baseURL` from `import.meta.env.VITE_API_BASE_URL`; request interceptor reads JWT from `localStorage` and adds `Authorization: Bearer` header; response interceptor handles 401 by redirecting to `/login` |

---

### Frontend — Context

| File | Purpose |
|------|---------|
| `frontend/src/context/AuthContext.jsx` | `AuthContext` and `AuthProvider`: holds `user` and `token` state; `login(token)` decodes JWT and saves to state + localStorage; `logout()` clears state + localStorage; `isAuthenticated` boolean derived from token presence |

---

### Frontend — Reusable Components

| File | Purpose |
|------|---------|
| `frontend/src/components/Navbar.jsx` | Persistent top navigation: FreelanceFlow logo, links to Dashboard / Clients / Projects / Invoices, user name display, logout button that calls `AuthContext.logout()` |
| `frontend/src/components/ProtectedRoute.jsx` | Route guard: reads `isAuthenticated` from `AuthContext`; renders `<Outlet />` if authenticated, `<Navigate to="/login">` otherwise |
| `frontend/src/components/Spinner.jsx` | Centered loading spinner using Tailwind `animate-spin`; accepts optional `size` prop |
| `frontend/src/components/ErrorMessage.jsx` | Styled error banner: receives `message` prop, renders dismissible red alert with API error text |
| `frontend/src/components/StatCard.jsx` | Dashboard metric card: `label` + `value` + optional `accent` color prop; used in `DashboardPage` |
| `frontend/src/components/Badge.jsx` | Pill-shaped status badge: maps status strings (`draft`, `sent`, `paid`, `overdue`, etc.) to Tailwind background color classes |
| `frontend/src/components/Modal.jsx` | Accessible modal wrapper: dark backdrop, centered content box, `onClose` prop; used for confirmation dialogs and inline forms |
| `frontend/src/components/Pagination.jsx` | Pagination UI: receives `page`, `totalPages`, `onPageChange`; renders Previous/Next buttons and current page indicator |
| `frontend/src/components/EmptyState.jsx` | Empty list placeholder: SVG icon + `message` prop + optional `actionLabel` + `onAction` — shown when list endpoints return zero results |

---

### Frontend — Pages

| File | Purpose |
|------|---------|
| `frontend/src/pages/LoginPage.jsx` | Controlled form: email + password inputs; `POST /auth/login` on submit; on success calls `AuthContext.login(token)` and navigates to `/dashboard`; shows `ErrorMessage` on failure |
| `frontend/src/pages/RegisterPage.jsx` | Controlled form: name + email + password; `POST /auth/register` on submit; on success calls `AuthContext.login(token)` and navigates to `/dashboard` |
| `frontend/src/pages/DashboardPage.jsx` | Fetches `GET /dashboard` on mount; renders `StatCard` grid (total clients, active projects, revenue, overdue invoices); renders recent invoices table with `Badge` statuses |
| `frontend/src/pages/ClientsPage.jsx` | Fetches `GET /clients` with pagination; renders client table with name, email, company, project count; inline "Add Client" form via `Modal`; archive button triggers `DELETE /clients/:id` with confirm dialog |
| `frontend/src/pages/ProjectsPage.jsx` | Fetches `GET /projects` with status filter tabs; renders project cards with client name, status `Badge`, deadline; "New Project" button opens `Modal` form with client dropdown; status update via dropdown triggers `PUT /projects/:id` |
| `frontend/src/pages/ProjectDetailPage.jsx` | Fetches `GET /projects/:id`; displays project header (title, client, status, budget, dates); milestone list with `isCompleted` checkmark; "Add Milestone" form; "Mark Complete" button per incomplete milestone calls `PATCH /milestones/:id/complete`; progress bar showing X/Y milestones complete |
| `frontend/src/pages/InvoicesPage.jsx` | Fetches `GET /invoices` with status filter; renders invoice table (number, client, total, due date, status `Badge`); "Create Invoice" button opens form with project selector and line item builder; link to detail page |
| `frontend/src/pages/InvoiceDetailPage.jsx` | Fetches `GET /invoices/:id`; displays all invoice fields, line items table with computed totals, tax row, grand total; payment history list; action buttons: "Download PDF" (opens `/invoices/:id/pdf` in new tab), "Send Email" (calls `POST /invoices/:id/send`), "Record Payment" form (amount + method); `Badge` showing current status |

---

## Architectural Rules

> These rules must be followed by any developer or AI coding tool working on this project.

1. **No business logic in controllers.** Controllers only call service methods and send HTTP responses. All logic lives in `*.service.js`.

2. **No direct model imports in controllers.** Controllers access data exclusively through the service layer.

3. **All async controllers use `asyncHandler`.** Never write raw try-catch in route handlers.

4. **All responses use `sendSuccess` / `sendError`.** Never write `res.json(...)` directly — always through the utility helpers.

5. **All routes are scoped by `freelancerId`.** Every query that reads/writes data must include `freelancerId: req.user._id` as a filter condition. No cross-user data leakage.

6. **`checkOwnership` must be applied to every single-resource route** (`GET /:id`, `PUT /:id`, `DELETE /:id`, `PATCH /:id/*`). It is not optional.

7. **Secrets only in `.env`.** No API keys, DB URIs, or JWT secrets in source code. `.env` is never committed. `.env.example` always is.

8. **PDF never touches disk.** `invoice.pdf.js` returns a Buffer. The buffer is piped to the HTTP response or passed to nodemailer. No `fs.writeFile` anywhere.

9. **Frontend axios calls are made directly in page components.** No custom hooks abstraction layer — keep it simple and readable for a portfolio project.

10. **`NODE_ENV=production` gates the dev router.** The `/dev/*` routes must silently return 404 in production. This is enforced in `dev.routes.js` itself, not at the router mounting level.

---

*End of STRUCTURE.md*