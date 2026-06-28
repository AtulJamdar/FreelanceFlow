# SPEC — backend/src/modules/auth/user.model.js

## File Role
Defines the Mongoose schema and model for a FreelanceFlow user (freelancer account), including password hashing via a pre-save hook and a password comparison method.

## Dependencies

| Import | Source | Purpose |
|---|---|---|
| `mongoose` | npm | Schema definition and model creation |
| `bcryptjs` | npm | Password hashing (pre-save) and comparison |

## Exports

### Default export: `User` (Mongoose Model)

#### Instance Method: `user.comparePassword(candidate)`
- **Parameters**: `candidate` (string) — the plain-text password submitted by the user
- **Return value**: `Promise<boolean>` — `true` if match, `false` if not
- **Side effects**: None
- **Throws**: May throw if bcrypt fails internally

## Data Contracts

### Schema: `userSchema`

| Field | Type | Required | Unique | Default | Validation / Notes |
|---|---|---|---|---|---|
| `name` | String | ✅ | ❌ | — | `trim: true`, min 2 chars |
| `email` | String | ✅ | ✅ | — | `trim: true`, `lowercase: true`, must match email validation regex |
| `passwordHash` | String | ✅ | ❌ | — | Stored as bcrypt hash — never plain text; `select: false` (excluded from queries by default) |
| `businessName` | String | ❌ | ❌ | — | `trim: true`, used in invoice PDF headers |
| `phone` | String | ❌ | ❌ | — | `trim: true` |
| `address` | String | ❌ | ❌ | — | `trim: true` |

### Virtuals
- `password` (string, write-only): Used to pass the plain-text password to the model during registration or updates. The pre-save hook intercepts this virtual to generate the `passwordHash`.

### Schema Options
- `{ timestamps: true }` — auto-manages `createdAt` and `updatedAt`

### Indexes
| Field | Type | Reason |
|---|---|---|
| `email` | unique | Enforced by `unique: true` on field — Mongoose creates index automatically |

### Pre-save Hook
- Intercepts when the plain-text `password` virtual/field is set or modified.
- Generates a bcrypt salt (12 rounds) and hashes the password, saving it into `this.passwordHash`.

## Rules & Constraints
- `email` must be unique across all users — duplicate registration must be rejected at database level.
- Password must **never** be stored as plain text — always hashed via the pre-save hook.
- `comparePassword` must use `bcryptjs.compare` — never compare plain strings.
- `name` and `email` must be trimmed.
- `email` must be lowercased before storage to ensure case-insensitive uniqueness.
- `passwordHash` must be excluded by default from queries via Mongoose configuration (`select: false`).

## Do NOT
- Do not store or return the raw `password` or `passwordHash` in API responses.
- Do not perform JWT creation or token logic in this file — that belongs in `auth.service.js`.
- Do not import or call any controller, service, or utility from this file.

## Related Files

| File | Relationship |
|---|---|
| [auth.service.js](file:///d:/Projects/MERN_Stack/FreelanceFlow/backend/src/modules/auth/auth.service.js) | Calls `User.create()`, `User.findOne()`, `user.comparePassword()` |
| [auth.js](file:///d:/Projects/MERN_Stack/FreelanceFlow/backend/src/middleware/auth.js) | Calls `User.findById(req.user._id)` |
