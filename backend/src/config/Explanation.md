# EXPLANATION — backend/src/config/

## Purpose (Why does this folder/file exist?)

The `config/` folder holds all **application-level configuration** — things that control *how* the app connects to external services and *what* environment it's running in. The main file here is `db.js`, which establishes the MongoDB connection.

Keeping configuration separate means:
- You change a DB URL in one place, not scattered across 10 files
- You can swap environments (dev → staging → production) without touching business logic
- Junior devs know exactly where to look when "the database won't connect"

---

## How it works (Step-by-step explanation in plain English)

### db.js — MongoDB Connection

1. `dotenv` is imported and `.config()` is called, which reads the `.env` file and loads variables into `process.env`
2. `mongoose.connect()` is called with the `MONGO_URI` environment variable
3. Mongoose returns a Promise — we `await` it inside an `async` function
4. If connection succeeds, we log a confirmation message
5. If it fails, we log the error and call `process.exit(1)` — this intentionally crashes the app because running without a DB is pointless and dangerous

```js
// Simplified version of what db.js does
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // 1 = failure exit code
  }
};

export default connectDB;
```

Then in `server.js`, you call `connectDB()` before starting the HTTP server.

---

## Key decisions

### Why dotenv?
Environment variables let you store secrets (DB passwords, JWT keys) **outside your code**. If you hardcode `mongodb://admin:password123@host` in your source code and push to GitHub, your database is now public. dotenv reads from a local `.env` file that is listed in `.gitignore`.

**Always add `.env` to `.gitignore`.** This is not optional.

### Why process.exit(1) on connection failure?
If the DB connection fails at startup, the app is broken — every API call will fail with a cryptic error. It's better to crash loudly and immediately so the developer (or deployment system) knows exactly what went wrong, rather than silently serving broken responses.

### Alternatives to dotenv
- **AWS Secrets Manager / Vault**: for production secrets management at scale
- **Docker secrets**: when running in containers
- **Environment variables set directly on the server**: works fine, but dotenv is easier for local dev

We use dotenv because it's simple, standard in Node.js projects, and works identically in every environment.

### Why Mongoose instead of the raw MongoDB driver?
The native MongoDB driver requires you to handle raw JSON documents — there's no schema validation, no type coercion, no built-in relationships. Mongoose adds:
- **Schemas**: define exactly what shape your data must have
- **Validation**: reject bad data before it hits the DB
- **Middleware hooks**: run code before/after save, delete, etc.
- **Populate**: simulate joins across collections

---

## Functions / Exports

### `connectDB()`
- **What it does**: Connects the app to MongoDB using the URI from environment variables
- **Parameters**: None
- **Returns**: `Promise<void>` — resolves on success, throws on failure
- **Gotchas**:
  - Must be called before any route tries to use a Mongoose model
  - If `MONGO_URI` is undefined (missing from `.env`), Mongoose will throw a confusing error — check your `.env` file first
  - In production, use a MongoDB Atlas URI with username/password embedded, not `localhost`

---

## What you should learn from this

- **Environment variables**: Why secrets never live in code, and how `process.env` works
- **dotenv**: How `.env` files work, and why `.gitignore` matters
- **Async/await with try-catch**: The standard pattern for handling async operations that can fail
- **Fail fast**: Crashing at startup with a clear message is better than silently failing later
- **process.exit()**: How Node.js communicates success (0) or failure (1) to the operating system