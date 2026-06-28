# EXPLANATION — backend/src/jobs/

## Purpose (Why does this folder/file exist?)

The `jobs/` folder contains **scheduled background tasks** — code that runs automatically on a timer, not in response to an HTTP request.

In FreelanceFlow, the key job is **overdue invoice detection**: every day, the system checks all invoices with a `dueDate` in the past and a `status` of `sent`, and marks them as `overdue`. Nobody has to click a button — it just happens.

---

## How it works (Step-by-step explanation in plain English)

### node-cron basics

`node-cron` is a library that lets you schedule functions using **cron syntax** — a compact string that defines *when* to run something.

Cron syntax has 5 (or 6) fields:

```
┌──────── minute (0-59)
│ ┌────── hour (0-23)
│ │ ┌──── day of month (1-31)
│ │ │ ┌── month (1-12)
│ │ │ │ ┌ day of week (0-7, 0 and 7 = Sunday)
│ │ │ │ │
* * * * *
```

Examples:
- `0 0 * * *` → every day at midnight (00:00)
- `0 9 * * 1` → every Monday at 9am
- `*/5 * * * *` → every 5 minutes
- `0 0 1 * *` → first day of every month at midnight

### overdueJob.js — Step-by-step

```js
import cron from 'node-cron';
import Invoice from '../models/Invoice.js';

const overdueJob = () => {
  cron.schedule('0 0 * * *', async () => {
    // Runs every day at midnight

    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize to start of day

    try {
      const result = await Invoice.updateMany(
        {
          status: 'sent',        // only invoices that have been sent
          dueDate: { $lt: today } // and whose due date is in the past
        },
        {
          $set: { status: 'overdue' }
        }
      );

      console.log(`[Overdue Job] Marked ${result.modifiedCount} invoices as overdue`);
    } catch (err) {
      console.error('[Overdue Job] Error:', err.message);
    }
  });
};

export default overdueJob;
```

Then in `server.js`:
```js
import overdueJob from './jobs/overdueJob.js';
overdueJob(); // registers the cron schedule
```

The job is **registered once at startup** and then fires automatically every midnight.

---

## Key decisions

### Why cron instead of checking on every request?

**On-request approach** (the naive way):
```js
// In the invoice controller, every time someone fetches invoices:
const invoices = await Invoice.find({ owner });
for (const inv of invoices) {
  if (inv.dueDate < new Date() && inv.status === 'sent') {
    inv.status = 'overdue';
    await inv.save(); // DB write on every read — bad!
  }
}
```

Problems with this:
- **Performance**: Every GET request triggers DB writes — slow and expensive
- **Inconsistency**: Status only updates when someone visits the dashboard. If nobody logs in for a week, invoices stay in "sent" status even though they're overdue.
- **Side effects in reads**: A GET request that also modifies data breaks the principle of HTTP idempotency

**Cron approach** (the right way):
- Runs once a day regardless of user activity
- Single batch update is efficient — one `updateMany` call instead of N individual writes
- The invoice status is always accurate, even if the user hasn't logged in
- GET routes remain pure reads

### Why `updateMany` instead of a loop?

```js
// Bad: N database roundtrips
for (const invoice of overdueInvoices) {
  await invoice.save();
}

// Good: 1 database roundtrip
await Invoice.updateMany({ status: 'sent', dueDate: { $lt: today } }, { $set: { status: 'overdue' } });
```

`updateMany` sends one operation to MongoDB that updates all matching documents atomically. The loop sends one network request per invoice — if you have 100 overdue invoices, that's 100x slower.

### Why not use a message queue (Bull, RabbitMQ)?

Message queues are more robust for production at scale — they handle retries, failures, and distributed processing. For FreelanceFlow (a single-server, personal tool), `node-cron` is:
- Simpler to set up and understand
- Zero infrastructure overhead (no Redis needed)
- Perfectly adequate for a daily batch job

If FreelanceFlow grew to serve thousands of freelancers, migrating to Bull (which runs on top of Redis) would be the next step.

### Why run the job at midnight?

- Invoices have a `dueDate` in terms of calendar days, not timestamps
- Running at midnight means a due date of "June 28" becomes overdue at the start of June 29 — which matches the user's mental model ("it was due yesterday")
- Avoids running during peak usage hours

---

## Functions / Exports

### `overdueJob()`
- **What it does**: Registers a cron schedule that runs every day at midnight, finding and marking overdue invoices
- **Parameters**: None
- **Returns**: void (the cron schedule runs in the background indefinitely)
- **Gotchas**:
  - Must be called once at app startup — calling it multiple times registers duplicate cron jobs
  - The job runs in the server's local timezone by default — if your server is in UTC but your users are in IST (+5:30), midnight UTC is 5:30am IST. You can pass a timezone option: `cron.schedule('0 0 * * *', fn, { timezone: 'Asia/Kolkata' })`
  - If the server restarts, the job is re-registered from scratch. Any invoices that became overdue while the server was down will be caught on the next midnight run.

---

## What you should learn from this

- **Cron syntax**: How to express time schedules in the `* * * * *` format
- **Background jobs**: Not all code runs in response to requests — some runs on a schedule
- **updateMany vs. loops**: Always prefer batch operations over N individual DB calls
- **Separation of concerns**: The job only marks invoices — it doesn't generate PDFs or send emails (those would be separate jobs or triggered by the status change)
- **When to use cron vs. queues**: Cron for simple scheduled tasks; queues for reliable job processing with retries at scale