# LabTrack (take-home)

Case list for a dental lab, with a timezone-proof due date and a "mark ready & email clinic" action.
Next.js (App Router, JavaScript) + MongoDB.

## Run locally
```
cp .env.example .env.local     # set MONGODB_URI (e.g. a free MongoDB Atlas cluster)
npm install
npm run db:setup               # creates indexes + sample cases (idempotent)
npm run dev
npm test                       # date tests, run under 4 different TZ settings
```
`db:setup` loads `.env.local` itself (Node 20.6+; the file is optional, so real environment variables also work).

## Deploy (Vercel)
1. Push to GitHub, import the repo in Vercel.
2. Create a free MongoDB Atlas cluster. Allow network access from anywhere (0.0.0.0/0), because Vercel's IPs change.
3. Add `MONGODB_URI`, `MONGODB_DB` and `LAB_TIMEZONE` (e.g. `Europe/London`) in Vercel.
4. Run `MONGODB_URI=... npm run db:setup` once from your machine.
5. Leave `EMAIL_MODE=test` for the demo. For real sending: `EMAIL_MODE=live`, `RESEND_API_KEY`, `EMAIL_FROM` (verified domain).

## The due-date bug and the fix
A due date is a calendar day ("ship by 1 Dec"), not a moment. The usual bug: store it as a timestamp (in Mongo, a
BSON Date, which is a UTC instant) or turn it into a JS `Date`, then print it in the viewer's time zone, so it
lands on the previous or next day. Fix, end to end:
- `dueDate` is stored as the plain string `"YYYY-MM-DD"`, never a Date. It sorts correctly as text.
- `lib/dates.js` only formats from that string (fixed UTC arithmetic), and computes "late/today" against the **lab's** zone.
- `test/dates.test.js` runs in UTC, Los Angeles, Kiritimati (UTC+14) and Pago Pago (UTC-11).
If existing data holds BSON Dates, it needs a one-off migration once we know what the time meant (see questions to Maria).

## Notifications
"Mark ready & email clinic" flips status with a conditional update (`status != ready`) and inserts one row into
`notifications`, which has a unique index on (caseRef, kind), so a double click or retry can't email twice.
Test mode records the email on `/outbox` without delivering it.

## Deliberately not built
WhatsApp, clinic logins, creating/editing cases, patient names in emails, retries for failed live sends, auth on the dashboard.
