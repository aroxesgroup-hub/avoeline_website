# Load report — T6 group 1 (local reads)

Target: local production build at `http://127.0.0.1:3000`. No Vercel run.

Thresholds from docs/25 A5:

| Scenario | Load | Pass bar |
| --- | --- | --- |
| Public event page `GET /events/{EVENT_ID}` | 300 VUs, 5 minutes | p95 under 800 ms, errors under 1%, status 200, warmed response shows a cache signal |
| Directory `GET /events` and `GET /events?q=concert` | 50 VUs, 2 minutes | p95 under 800 ms, errors under 1%, status 200 |

The public page already sets `revalidate = 60` in `src/app/events/[eventId]/page.tsx`. This group did not change cache, indexes, capacity, or the in-memory rate limiter.

## This run

**Not executed.** `k6` is not on PATH on this machine (`k6 version` failed). `npm run test:load:reads` wrote `reports/load/status.json` with `executed: false` and reason `k6 is not on PATH`. No p95 or error rate was measured. No before/after fix.

Measured safe capacity: unknown until k6 runs against `npm run start` with `APP_ENV=local` and a published `EVENT_ID`.

## Later groups (not run)

1. Registration burst, offers, live counters, fake email sender.
2. Check-in double scans and approvals.
3. Hackathon submit burst, scoreboard poll, 30-minute soak.
