# EXPLANATION — backend/src/middleware/

## Purpose (Why does this folder/file exist?)

Middleware are functions that sit **between** an incoming HTTP request and the final route handler. They can inspect, modify, or reject requests before the controller ever sees them.

The `middleware/` folder contains two critical pieces:
1. **`authMiddleware.js`** — verifies the user is logged in (JWT check)
2. **`errorHandler.js`** — catches any errors thrown anywhere in the app and returns a consistent JSON error response

Without middleware, every single route would need its own auth check and its own error formatting — hundreds of lines of duplicated code.

---

## How it works (Step-by-step explanation in plain English)

### How Express Middleware Chain Works

Every Express middleware function receives three arguments: `(req, res, next)`.

- `req` — the incoming request (headers, body, params)
- `res` — the response object (used to send data back)
- `next` — a function you call to pass control to the next middleware or route

```
Request
  ↓
[Middleware 1: JSON parser]   → calls next()
  ↓
[Middleware 2: Auth check]    → calls next() if valid, or res.status(401) if not
  ↓
[Route Handler: Controller]   → sends final response
  ↓
[Error Handler]               → only reached if next(error) was called
```

If a middleware does NOT call `next()`, the request stops there. This is how auth middleware blocks unauthorized requests.

---

### authMiddleware.js — JWT Verification

**What is a JWT?**
A JSON Web Token (JWT) is a signed string that encodes user identity. When a user logs in, the server creates a JWT containing their user ID and signs it with a secret key. The client stores this token and sends it with every future request in the `Authorization` header.

**Step-by-step flow:**
1. Extract the token from the `Authorization` header (`Bearer <token>`)
2. If no token is found → respond with `401 Unauthorized` immediately
3. Call `jwt.verify(token, process.env.JWT_SECRET)` — this checks the signature and expiry
4. If invalid or expired → respond with `401 Unauthorized`
5. If valid → decode the payload (contains `userId`), attach it to `req.user`
6. Call `next()` — the route handler can now access `req.user`

```js
// Simplified authMiddleware.js
import jwt from 'jsonwebtoken';

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

export default protect;
```

**Usage in routes:**
```js
router.get('/clients', protect, getClients);
//                     ↑ middleware runs first
```

---

### errorHandler.js — Global Error Handler

Express has a special type of middleware for errors — it takes **4 parameters**: `(err, req, res, next)`. The extra `err` argument is what tells Express this is an error handler.

When any route or service throws an error (or calls `next(error)`), Express skips all normal middleware and jumps directly to the error handler.

```js
// Simplified errorHandler.js
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export default errorHandler;
```

Key points:
- If `res.statusCode` is still 200 (default), it means something crashed unexpectedly → use 500
- We hide the stack trace in production (security) but show it in development (debugging)
- This must be registered **last** in `server.js`, after all routes

---

## Key decisions

### Why JWT instead of sessions?
Sessions store user state on the server (in memory or Redis). JWTs are **stateless** — all the information is in the token itself. This means:
- No server-side session store needed
- Scales horizontally (multiple servers don't need to share session state)
- Works well for REST APIs consumed by mobile apps or other services

**Trade-off**: JWTs can't be invalidated before expiry without extra infrastructure (a blocklist). For FreelanceFlow (a personal tool), this is acceptable.

### Why attach user info to req.user?
Controllers need to know *who* is making the request to fetch only their data. By attaching the decoded token to `req.user` in middleware, every downstream controller and service can access `req.user.userId` without re-verifying the token.

### Why a global error handler?
Without it, you'd need a try-catch in every single controller function. With it, controllers can `throw` naturally and the error handler formats everything consistently. One place to change error format = one place to update.

---

## Functions / Exports

### `protect(req, res, next)`
- **What it does**: Verifies the JWT in the Authorization header
- **Parameters**: Standard Express middleware params
- **Returns**: Calls `next()` on success, sends 401 response on failure
- **Gotchas**:
  - Token must be sent as `Authorization: Bearer <token>` — not as a cookie, not as a query param
  - `JWT_SECRET` must match the secret used when the token was *created* (in `authService.js`)
  - A valid token from a deleted user will still pass this check — for FreelanceFlow's scale, this is acceptable

### `errorHandler(err, req, res, next)`
- **What it does**: Catches any error passed via `next(err)` or thrown in async middleware
- **Parameters**: `err` (the Error object), `req`, `res`, `next`
- **Returns**: JSON error response
- **Gotchas**:
  - Must be registered **after** all routes in `server.js`
  - Async route handlers need either try-catch + `next(err)`, or a wrapper like `express-async-errors`

---

## What you should learn from this

- **Middleware chain**: Requests flow through functions in order; any function can stop the chain
- **JWT authentication**: How stateless auth works — sign on login, verify on every request
- **req.user pattern**: Attaching data to the request object so downstream handlers can use it
- **Global error handling**: Centralizing error formatting to avoid repetition
- **4-argument middleware**: Express's special signature for error handlers — the `err` first param is the signal