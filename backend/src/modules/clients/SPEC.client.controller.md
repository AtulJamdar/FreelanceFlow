# SPEC — backend/src/modules/clients/client.controller.js

## File Role
Handles HTTP request/response logic for Client operations — creating, reading, updating, and archiving clients. All business logic and database queries are handled in the service layer (`client.service.js`).

## Dependencies

| Import | Source | Purpose |
|---|---|---|
| `clientService` | `./client.service.js` | Business logic implementation for Client CRUD operations |
| `sendSuccess`, `sendError` | `../../utils/apiResponse.js` | Standardized API response format helpers |

## Exports

### `createClient(req, res)`
- **Parameters**: `req.body.name`, `req.body.email`, and optional `phone`, `company`, `address`, `notes` (plus `req.user._id` from auth middleware)
- **Return value**: `void` — sends HTTP response via `sendSuccess`
- **Side effects**: Invokes `clientService.createClient`
- **Throws**: Captured by `asyncHandler`

### `getClients(req, res)`
- **Parameters**: `req.query.page`, `req.query.limit` (plus `req.user._id`)
- **Return value**: `void`
- **Side effects**: Invokes `clientService.getAllClients`
- **Throws**: Captured by `asyncHandler`

### `getClient(req, res)`
- **Parameters**: `req.params.id` (plus `req.user._id`)
- **Return value**: `void`
- **Side effects**: Invokes `clientService.getClientById`
- **Throws**: Captured by `asyncHandler`

### `updateClient(req, res)`
- **Parameters**: `req.params.id`, `req.body` (updatable fields) (plus `req.user._id`)
- **Return value**: `void`
- **Side effects**: Invokes `clientService.updateClient`
- **Throws**: Captured by `asyncHandler`

### `deleteClient(req, res)`
- **Parameters**: `req.params.id` (plus `req.user._id`)
- **Return value**: `void`
- **Side effects**: Invokes `clientService.archiveClient` (soft delete)
- **Throws**: Captured by `asyncHandler`

## Data Contracts

### `POST /api/v1/clients`
**Request Body:**
```json
{
  "name": "Acme Corp",
  "email": "billing@acme.com",
  "phone": "+91-9876543210",
  "company": "Acme Corporation",
  "address": "Mumbai, India",
  "notes": "Prefers invoice by 1st of month"
}
```
**Success Response `201`:**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
    "freelancerId": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Acme Corp",
    "email": "billing@acme.com",
    "phone": "+91-9876543210",
    "company": "Acme Corporation",
    "address": "Mumbai, India",
    "notes": "Prefers invoice by 1st of month",
    "isArchived": false,
    "createdAt": "2026-06-28T16:00:00.000Z",
    "updatedAt": "2026-06-28T16:00:00.000Z"
  }
}
```

### `GET /api/v1/clients`
**Success Response `200`:**
```json
{
  "success": true,
  "data": {
    "clients": [
      {
        "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
        "name": "Acme Corp",
        "email": "billing@acme.com",
        "isArchived": false
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

### `GET /api/v1/clients/:id`
**Success Response `200`:**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
    "name": "Acme Corp",
    "email": "billing@acme.com",
    "projectCount": 3
  }
}
```

### `PUT /api/v1/clients/:id`
**Request Body:**
```json
{
  "notes": "Updated billing details"
}
```
**Success Response `200`:**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
    "name": "Acme Corp",
    "email": "billing@acme.com",
    "notes": "Updated billing details"
  }
}
```

### `DELETE /api/v1/clients/:id`
**Success Response `200`:**
```json
{
  "success": true,
  "data": {
    "message": "Client archived successfully"
  }
}
```

## Rules & Constraints
- The controller must not import models directly.
- Standard response shapes (`sendSuccess` / `sendError`) must be used exclusively.
- Handlers must be wrapped in `asyncHandler` at the router level.
- Ownership must be verified on all single-resource operations via the `checkOwnership` middleware.

## Do NOT
- Do not make queries directly to Mongoose models.
- Do not implement custom validation logic or checks for active projects here (delegate to `client.service.js`).

## Related Files

| File | Relationship |
|---|---|
| [client.service.js](file:///d:/Projects/MERN_Stack/FreelanceFlow/backend/src/modules/clients/client.service.js) | Core business logic layer |
| [checkOwnership.js](file:///d:/Projects/MERN_Stack/FreelanceFlow/backend/src/middleware/checkOwnership.js) | Route middleware that validates client belongs to user |
| [client.routes.js](file:///d:/Projects/MERN_Stack/FreelanceFlow/backend/src/modules/clients/client.routes.js) | Map routes to these handlers |