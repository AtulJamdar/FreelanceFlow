# SPEC — backend/src/modules/clients/client.model.js

## File Role
Defines the Mongoose schema and model for a Client — a person or business that a freelancer bills; every client is scoped to exactly one freelancer account.

## Dependencies

| Import | Source | Purpose |
|---|---|---|
| `mongoose` | npm | Schema definition and model creation |

## Exports

### Default export: `Client` (Mongoose Model)

No custom instance methods or statics.

## Data Contracts

### Schema: `clientSchema`

| Field | Type | Required | Default | Validation / Notes |
|---|---|---|---|---|
| `freelancerId` | ObjectId | ✅ | — | `ref: 'User'` — the freelancer who owns this client |
| `name` | String | ✅ | — | `trim: true` |
| `email` | String | ✅ | — | `trim: true`, `lowercase: true`, must match email validation regex |
| `phone` | String | ❌ | — | `trim: true` |
| `company` | String | ❌ | — | `trim: true` |
| `address` | String | ❌ | — | `trim: true` |
| `notes` | String | ❌ | — | `trim: true` |
| `isArchived` | Boolean | ✅ | `false` | soft-delete flag |

### Schema Options
- `{ timestamps: true }` — auto-manages `createdAt` and `updatedAt`

### Indexes
| Field(s) | Type | Reason |
|---|---|---|
| `freelancerId` | Standard | Fast lookup of all clients belonging to a user |
| `freelancerId` + `email` | Compound Unique | Enforce unique email per freelancer (a client email can exist for different freelancers, but not twice for the same freelancer) |

## Rules & Constraints
- Every client **must** have a `freelancerId` reference.
- Uniqueness of `email` is scoped to the `freelancerId` using a compound unique index.
- `email` must be lowercased before saving.
- All client CRUD or retrieve operations must filter by `freelancerId` (from `req.user._id`).

## Do NOT
- Do not store projects or invoices directly inside the client document.
- Do not make the compound index global — it must scope `email` per `freelancerId`.

## Related Files

| File | Relationship |
|---|---|
| [user.model.js](file:///d:/Projects/MERN_Stack/FreelanceFlow/backend/src/modules/auth/user.model.js) | Referenced by `freelancerId` |
| [client.service.js](file:///d:/Projects/MERN_Stack/FreelanceFlow/backend/src/modules/clients/client.service.js) | Primary CRUD service |
| [client.routes.js](file:///d:/Projects/MERN_Stack/FreelanceFlow/backend/src/modules/clients/client.routes.js) | Scopes endpoints via `checkOwnership(Client)` |
