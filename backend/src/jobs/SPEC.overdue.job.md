# SPEC — backend/src/jobs/overdue.job.js

## File Role
A scheduled background job that runs daily at 12:05 AM to identify unpaid invoices past their due dates, update their status to `'overdue'`, and dispatch notification reminder emails to the clients.

## Dependencies

| Import | Source | Purpose |
|---|---|---|
| `node-cron` | npm | Task scheduling |
| `Invoice` | `../modules/invoices/invoice.model.js` | Finding and updating overdue invoices |
| `sendEmail` | `../utils/email.js` | Dispatching overdue reminder emails |

## Exports

### Named export: `registerOverdueJob()`
- **Parameters**: None
- **Return value**: `void`
- **Side effects**: Registers a scheduled task in node-cron
- **Throws**: Never throws (all errors caught internally and logged)

## Data Contracts

### Cron Schedule Expression
```
"5 0 * * *"  --> Runs at 12:05 AM (midnight + 5 minutes) every day
```

### Query Executed
```js
Invoice.find({
  status: { $in: ['sent', 'partially_paid'] },
  dueDate: { $lt: new Date() }
}).populate('clientId freelancerId')
```

### Logs
- Log success output: `[OverdueJob] ✓ Processed overdue check. Marked X invoices as overdue.`
- Log failure output: `[OverdueJob] ✗ Error running overdue check: <error message>`

## Rules & Constraints
- The query must target invoices with status `'sent'` or `'partially_paid'` whose `dueDate` is strictly less than the current date and time.
- For each overdue invoice found:
  - Update status to `'overdue'`.
  - Compile the overdue email template using the client and freelancer data.
  - Send the email reminder via `sendEmail()`.
  - Wrap email dispatches in `Promise.allSettled` to ensure one failure does not halt other notifications.
- All errors during execution must be caught and logged, preventing the Express process from crashing.
- This job must be registered exactly once at server startup (in `server.js`).

## Do NOT
- Do not let the cron job throw uncaught errors.
- Do not run this job multiple times.
- Do not make this job trigger HTTP request/response sequences.

## Related Files

| File | Relationship |
|---|---|
| [server.js](file:///d:/Projects/MERN_Stack/FreelanceFlow/backend/server.js) | Registers the job on startup |
| [invoice.model.js](file:///d:/Projects/MERN_Stack/FreelanceFlow/backend/src/modules/invoices/invoice.model.js) | Collection being scanned and updated |
| [email.js](file:///d:/Projects/MERN_Stack/FreelanceFlow/backend/src/utils/email.js) | Transporter and email sending utility |
