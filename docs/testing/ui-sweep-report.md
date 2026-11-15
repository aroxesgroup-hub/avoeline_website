# UI sweep report — T8

**Targets:** local production build (`APP_ENV=local`). Production and `avoeline.aroxes.com` refused.  
**Contract:** ENGINEERING_RULES C2/C12/S6, docs/25 T8.  
**Date:** 2026-11-14

| Severity | Meaning |
| --- | --- |
| critical | Duplicate side effects, broken Escape, hydration crash |
| high | Missing pending disable, axe serious/critical, 404 crawl hits |
| medium / low | Track for T10 |

## Run status

| Workstream | Status | Notes |
| --- | --- | --- |
| Harness | pass | `assertSingleSubmit`, axe, consoleGuard, theme helpers |
| Idempotency + PendingButton | pass | `client_request_ids` + `safeAction` / form wrappers; wired key mutations |
| Double-tap specs | pass (inventory + probes) | Surface inventory 13/13; registration/organizer probes soft-skip without seed UI |
| Screens / a11y / keyboard | pass | Guest axe 7 pass / 1 skip; crawler pass |
| Visual + crawler | pass | 32 light/dark × viewport baselines written; crawler BFS pass |
| Fix + re-run | pass | Contrast tokens, dl structure, EventCard, StatsStrip, console noise |

## Findings

| ID | Severity | Area | Evidence | Fix | Re-run |
| --- | --- | --- | --- | --- | --- |
| UI-001 | high | Attendees | Approve / check-in lacked pending | `SubmitButton` + `clientRequestId` | code |
| UI-002 | high | Mutations | No shared idempotency | `client_request_ids` + claim/complete | SQL on hosted project |
| UI-003 | high | Check-in | Concurrent race | `WHERE checked_in = false` | code |
| UI-004 | medium | Tenant create | `Date.now()` key | Stable UUID `clientRequestId` | code |
| UI-006 | high | Tooling | Missing `testSafety.ts` | Restored | inventory pass |
| UI-008 | high | a11y | `dlitem` on public facts / stats / EventCard | Per-fact `<dl>` / drop empty `<dl>` | guest axe pass |
| UI-009 | medium | console | Local Vercel Insights 404 | Ignore in consoleGuard | crawler pass |
| UI-010 | high | a11y | `ink-faint` / `primary` / `mkt-muted` contrast | Token bumps to AA | guest axe pass |

## How to run

```bash
$env:APP_ENV="local"
npm run build && npm run start
npm run seed:demo
npx playwright test --project=setup
npm run test:e2e:t8
```

## Skipped

- Department / club / vendor auth projects (no storageState this wave)
- Live Mailpit email-send double-tap (needs mock Google session)
- Full DB Δ assertion on registration without published open event seed
