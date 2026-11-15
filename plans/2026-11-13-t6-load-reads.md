# T6 group 1 — local read-path load

Status: done

## What shipped

- `tests/load/public-event.js` — 300 VUs, 5 minutes, `GET /events/{EVENT_ID}`, p95 under 800 ms, errors under 1%, cache-signal check.
- `tests/load/directory.js` — 50 VUs, 2 minutes, `GET /events` and `GET /events?q=concert`.
- `tests/load/guard.mjs` and `tests/load/run-reads.mjs` — `APP_ENV=local` only; refuses production and `avoeline.aroxes.com`.
- `npm run test:load:reads`. Summaries under `reports/load/` (gitignored except the README).
- `docs/testing/load-report.md`, pointer in `docs/testing/README.md`, load rows in `docs/testing/test-matrix.md`.

## Run

Not executed. k6 is not installed on this machine. No p95 was recorded and no cache or query fix was applied.

## Later pauses

Registration burst, check-in, hackathon/scoreboard, and the 30-minute soak. No Vercel load until that run is confirmed.
