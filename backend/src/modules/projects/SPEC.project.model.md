# SPEC — backend/src/modules/projects/project.model.js

## File Role
Defines the Mongoose schema and model for a Project — a scoped engagement or contract for a client, owned by a freelancer, which can contain Milestones and be linked to Invoices.

## Dependencies

| Import | Source | Purpose |
|---|---|---|
| `mongoose` | npm | Schema definition and model creation |

## Exports

### Default export: `Project` (Mongoose Model)

No custom instance methods or statics.

## Data Contracts

### Schema: `projectSchema`

| Field | Type | Required | Default | Validation / Notes |
|---|---|---|---|---|
| `freelancerId` | ObjectId | ✅ | — | `ref: 'User'` — the freelancer owner |
| `clientId` | ObjectId | ✅ | — | `ref: 'Client'` — the client |
| `title` | String | ✅ | — | `trim: true` |
| `description` | String | ❌ | — | `trim: true` |
| `status` | String | ✅ | `'not_started'` | Enum: `['not_started', 'in_progress', 'on_hold', 'completed']` |
| `startDate` | Date | ✅ | — | ISO date |
| `deadline` | Date | ❌ | — | ISO date; must be >= `startDate` (validated in service layer) |
| `totalBudget` | Number | ❌ | — | Non-negative number |
| `currency` | String | ✅ | `'INR'` | Currency code |
| `isArchived` | Boolean | ✅ | `false` | soft-delete flag |

### Schema Options
- `{ timestamps: true }` — auto-manages `createdAt` and `updatedAt`

### Indexes
| Field(s) | Type | Reason |
|---|---|---|
| `freelancerId` | Standard | Fetch all projects for a freelancer |
| `freelancerId` + `clientId` | Compound | Compound index on freelancer and client for fast filtering |
| `freelancerId` + `status` | Compound | Filter projects by status per user |

## Rules & Constraints
- `freelancerId` is mandatory.
- `clientId` is mandatory and must belong to the same `freelancerId` (enforced at service layer).
- `status` must be one of: `'not_started'`, `'in_progress'`, `'on_hold'`, `'completed'`.
- `deadline`, if provided, must not be earlier than `startDate` (enforced at service layer).
- `totalBudget`, if provided, must be a non-negative number.
- All queries must filter by `freelancerId`.

## Do NOT
- Do not embed Milestones inside the Project document — Milestones are in a separate collection.
- Do not compute derived dashboard totals here.

## Related Files

| File | Relationship |
|---|---|
| [user.model.js](file:///d:/Projects/MERN_Stack/FreelanceFlow/backend/src/modules/auth/user.model.js) | Referenced by `freelancerId` |
| [client.model.js](file:///d:/Projects/MERN_Stack/FreelanceFlow/backend/src/modules/clients/client.model.js) | Referenced by `clientId` |
| [milestone.model.js](file:///d:/Projects/MERN_Stack/FreelanceFlow/backend/src/modules/milestones/milestone.model.js) | Milestones refer to this Project |
| [project.service.js](file:///d:/Projects/MERN_Stack/FreelanceFlow/backend/src/modules/projects/project.service.js) | CRUD business logic |
