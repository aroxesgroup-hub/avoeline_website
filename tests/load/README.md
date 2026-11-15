# Load tests (T6 group 1 — reads)

Local production build only. These scripts do not call server actions.

## Requirements

- [k6](https://k6.io/) on `PATH`
- `APP_ENV=local`
- `npm run build` then `npm run start` (serves `http://127.0.0.1:3000`)
- `EVENT_ID` of a published event on that server

The runner refuses `APP_ENV=production`, any host outside `TEST_HOST_ALLOWLIST` (default `localhost,127.0.0.1`), and `avoeline.aroxes.com`.

## Run

```bash
$env:APP_ENV="local"
$env:BASE_URL="http://127.0.0.1:3000"
$env:EVENT_ID="<published-event-uuid>"
npm run test:load:reads
```

`npm run test:load:reads` runs:

1. `tests/load/public-event.js` — 300 VUs for 5 minutes, `GET /events/{EVENT_ID}`. Thresholds: error rate under 1%, p95 under 800 ms. Each response is checked for status 200 and a cache signal (`x-nextjs-cache` HIT/STALE, `cache-control` max-age, or `age`).
2. `tests/load/directory.js` — 50 VUs for 2 minutes, `GET /events` and `GET /events?q=concert`. Same error and p95 thresholds.

Summaries land in `reports/load/` (gitignored). If k6 or the local server is missing, the command exits 0 and writes `reports/load/status.json` with `executed: false`.

Registration, check-in, hackathon, and the soak are later groups. k6 does not call `registerAttendeeAction` here.
