# SPEC — backend/src/modules/milestones/milestone.model.js

## File Role
Defines the Mongoose schema and model for a Milestone — a task or deliverable within a project that can be billed upon completion.

## Dependencies

| Import | Source | Purpose |
|---|---|---|
| `mongoose` | npm | Schema definition and model creation |

## Exports

### Default export: `Milestone` (Mongoose Model)

No custom instance methods or statics.

## Data Contracts

### Schema: `milestoneSchema`

| Field | Type | Required | Default | Validation / Notes |
|---|---|---|---|---|
| `projectId` | ObjectId | ✅ | — | `ref: 'Project'` — parent project |
| `freelancerId` | ObjectId | ✅ | — | `ref: 'User'` — denormalized for query performance / user isolation |
| `title` | String | ✅ | — | `trim: true` |
| `description` | String | ❌ | — | `trim: true` |
| `dueDate` | Date | ❌ | — | ISO date |
| `amount` | Number | ❌ | — | Billable value; non-negative number |
| `isCompleted` | Boolean | ✅ | `false` | One-way flag; cannot be toggled back to `false` once `true` (enforced at service layer) |
| `completedAt` | Date | ❌ | — | Timestamp set when `isCompleted` is marked `true` |

### Schema Options
- `{ timestamps: true }` — auto-manages `createdAt` and `updatedAt`

### Indexes
| Field(s) | Type | Reason |
|---|---|---|
| `projectId` | Standard | Retrieve all milestones under a project quickly |
| `freelancerId` | Standard | Scoping queries to the owner |

## Rules & Constraints
- `projectId` is mandatory.
- `freelancerId` is mandatory and must match the parent project's owner.
- `amount`, if provided, must be >= 0.
- `isCompleted` starts as `false`. Transitioning to `true` is a one-way operation. When `isCompleted` is set to `true`, `completedAt` must be set to the current date and time (handled at service layer).
- Deleting a milestone is blocked if it is already completed (enforced at service layer).
- Creating or updating a milestone is blocked if the parent project is already completed (enforced at service layer).

## Do NOT
- Do not allow direct modification of `completedAt` via standard update requests — it must only be set when `isCompleted` transitions to `true`.
- Do not allow toggling `isCompleted` from `true` back to `false`.

## Related Files

| File | Relationship |
|---|---|
| [project.model.js](file:///d:/Projects/MERN_Stack/FreelanceFlow/backend/src/modules/projects/project.model.js) | Parent entity |
| [milestone.service.js](file:///d:/Projects/MERN_Stack/FreelanceFlow/backend/src/modules/milestones/milestone.service.js) | CRUD and completion logic |
