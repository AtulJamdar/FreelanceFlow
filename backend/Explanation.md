# EXPLANATION — backend/

## Purpose (Why does this folder/file exist?)

The `backend/` folder contains the entire server-side application for FreelanceFlow. It is responsible for:
- Exposing a REST API that the frontend (and any future clients) can consume
- Handling authentication and authorization
- Communicating with the MongoDB database
- Running background jobs (like overdue invoice detection)
- Generating PDFs and sending emails

Without this folder, there is no data persistence, no security, and no business logic — the frontend would have nothing to talk to.

---

## How it works (Step-by-step explanation in plain English)

1. The entry point is `src/server.js` (or `src/app.js`). It starts an Express HTTP server on a configured port.
2. Express middleware is registered first — things like JSON body parsing, CORS headers, and authentication checks.
3. Route files are mounted onto the app (e.g., `/api/auth`, `/api/clients`, `/api/invoices`).
4. Each route delegates work to a **controller**, which delegates business logic to a **service**.
5. Services interact with **Mongoose models** to read/write MongoDB.
6. A background **job** runs on a schedule to flag overdue invoices.
7. **Utils** (PDF generation, email sending) are called by services when needed.

```
Request → Route → Controller → Service → Model (MongoDB)
                                       ↘ Utils (PDF/Email)
```

---

## Key decisions (Why did we choose this approach?)

### MVC Architecture (Model-View-Controller)
We use MVC because it enforces **separation of concerns** — each layer has one job:

| Layer | Job | Example |
|---|---|---|
| Route | Define URL + HTTP method | `POST /api/invoices` |
| Controller | Parse request, send response | Extract `req.body`, call service, return JSON |
| Service | Business logic | Calculate totals, check ownership |
| Model | Data shape + DB queries | Mongoose schema + `.find()` |

**Why not put everything in the route?** Because a 500-line route file becomes impossible to test, debug, or reuse. Separation means you can unit-test a service function without spinning up an HTTP server.

### Why Express?
- Minimal, unopinionated, and widely understood
- Huge ecosystem of middleware
- Easy to structure however you want (unlike NestJS which enforces its own conventions)

### Why MongoDB + Mongoose?
- Freelance data (projects, milestones, invoices) has variable structure — NoSQL handles this gracefully
- Mongoose adds schema validation on top of MongoDB's flexibility
- `ref` + `populate` gives us relational-style joins when needed

---

## Folder Structure Explained

```
backend/
├── src/
│   ├── config/        ← DB connection, environment setup
│   ├── middleware/    ← Auth checks, error handling
│   ├── models/        ← Mongoose schemas (data shape)
│   ├── routes/        ← URL definitions, parameter extraction
│   ├── controllers/   ← Request/response handling
│   ├── services/      ← Business logic (the "brain")
│   ├── jobs/          ← Scheduled background tasks
│   └── utils/         ← Reusable helpers (PDF, email)
├── .env               ← Environment variables (never commit this)
├── package.json
└── server.js          ← App entry point
```

Each folder has a single responsibility. If you need to find "where invoices are calculated," you go to `services/invoiceService.js` — not a route, not a model.

---

## What you should learn from this

- **Separation of concerns**: Each file/folder has one job. This makes code easier to read, test, and change.
- **Layered architecture**: A request passes through multiple layers, each doing its part.
- **Why MVC exists**: Not because it's a rule, but because mixing concerns leads to "spaghetti code" that breaks when you touch it.
- **Entry points**: Every Node.js app has one file that starts everything — find that file first when exploring any backend.