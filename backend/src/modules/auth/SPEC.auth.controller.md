# SPEC — backend/src/modules/auth/auth.controller.js

## File Role
Handles HTTP request/response logic for user authentication and profile management — registration, login, retrieving current profile, and updating profile. All business logic is delegated to `auth.service.js`.

## Dependencies

| Import | Source | Purpose |
|---|---|---|
| `authService` | `./auth.service.js` | Business logic implementation for registration, login, and updates |
| `sendSuccess`, `sendError` | `../../utils/apiResponse.js` | Standardized API response format helpers |

## Exports

### `register(req, res)`
- **Parameters**: `req.body.name`, `req.body.email`, `req.body.password`, plus optional `businessName`, `phone`, `address`
- **Return value**: `void` — sends a HTTP response using `sendSuccess`
- **Side effects**: Invokes `authService.registerUser`
- **Throws**: Captured by `asyncHandler` and passed to error handler middleware

### `login(req, res)`
- **Parameters**: `req.body.email`, `req.body.password`
- **Return value**: `void`
- **Side effects**: Invokes `authService.loginUser`
- **Throws**: Captured by `asyncHandler`

### `getMe(req, res)`
- **Parameters**: None (`req.user._id` set by `auth` middleware)
- **Return value**: `void`
- **Side effects**: Returns the user object attached to `req.user`
- **Throws**: Captured by `asyncHandler`

### `updateMe(req, res)`
- **Parameters**: `req.body` (subset of name, businessName, phone, address)
- **Return value**: `void`
- **Side effects**: Invokes `authService.updateProfile`
- **Throws**: Captured by `asyncHandler`

## Data Contracts

### Standard Success Response Format
All success responses must wrap data in:
```json
{
  "success": true,
  "data": { ... }
}
```

### Standard Error Response Format
All error responses must follow the shape:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "field": "fieldName" // optional, for validation errors
  }
}
```

---

### `POST /api/v1/auth/register`
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "businessName": "JD Consulting" // optional
}
```
**Success Response `201`:**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "John Doe",
    "email": "john@example.com",
    "businessName": "JD Consulting",
    "token": "jwt-token-string"
  }
}
```

### `POST /api/v1/auth/login`
**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```
**Success Response `200`:**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "jwt-token-string"
  }
}
```

### `GET /api/v1/auth/me`
**Headers:** `Authorization: Bearer <token>`
**Success Response `200`:**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "John Doe",
    "email": "john@example.com",
    "businessName": "JD Consulting",
    "phone": null,
    "address": null
  }
}
```

### `PUT /api/v1/auth/me`
**Headers:** `Authorization: Bearer <token>`
**Request Body:** Any updatable fields (`name`, `businessName`, `phone`, `address`)
**Success Response `200`:**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "John Doe Updated",
    "businessName": "JD Enterprises",
    "phone": "+91-9999999999",
    "address": "Mumbai, India"
  }
}
```

## Rules & Constraints
- No business logic inside controllers.
- No direct database models must be imported or queried.
- All routes must be wrapped with `asyncHandler` in route files.
- Response payloads must exclude passwords.

## Do NOT
- Do not import Mongoose models directly.
- Do not write manual `try/catch` blocks inside controllers.
- Do not use `res.json(...)` or `res.status(...).json(...)` — use `sendSuccess` and `sendError`.

## Related Files

| File | Relationship |
|---|---|
| [auth.service.js](file:///d:/Projects/MERN_Stack/FreelanceFlow/backend/src/modules/auth/auth.service.js) | Implements all the core logic called by these handlers |
| [auth.routes.js](file:///d:/Projects/MERN_Stack/FreelanceFlow/backend/src/modules/auth/auth.routes.js) | Maps HTTP endpoints to these functions |
| [apiResponse.js](file:///d:/Projects/MERN_Stack/FreelanceFlow/backend/src/utils/apiResponse.js) | Formatting helpers |