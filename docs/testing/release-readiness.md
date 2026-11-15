# Release readiness (docs/25 T10)

**Date:** 2026-11-15  
**Verdict:** **NO-GO**  
**Evidence:** [load-report.md](load-report.md), [security-report.md](security-report.md), [ui-sweep-report.md](ui-sweep-report.md), [plan-isolation-report.md](plan-isolation-report.md), [test-matrix.md](test-matrix.md).

Do not claim GO while load is unmeasured or live email / Google / Lighthouse checklists are absent.

---

## Area status

| Area | Status | Basis |
| --- | --- | --- |
| Unit | **pass** | `npm run test:unit` + security/permission unit suites |
| Integration | **partial** | Status CHECK tests + optional marketing RLS (`SUPABASE_DB_URL`); no full DB integration gate without secrets |
| API | **pass (local)** | Postman Negative Newman 20/20; `npm run test:api-smoke` |
| E2E | **pass (scoped)** | `e2e/smoke.spec.ts`, T8, T9 local; dept/club/vendor auth projects skipped |
| Email | **fail / not executed** | Guards + snapshots exist; no T5 `live-smoke.md` / allowlisted inbox report |
| Google | **partial** | MSW mock unit smoke; live session via `npm run auth:google`; T5 live not run |
| Load | **fail / not executed** | k6 not on PATH; capacity **unknown** |
| Security | **pass with debt** | T7 critical/highs fixed; open mediums SEC-005/006/008 |
| UI sweep | **pass** | Double-tap inventory + pending/idempotency ([ui-sweep-report.md](ui-sweep-report.md)) |
| Accessibility | **pass (scoped)** | Guest axe after UI-008/010; not full product surface |
| Plan isolation | **pass** | T9 highs fixed; Playwright 4/4 |

---

## Go / no-go checklist

| Gate | Required | Current |
| --- | --- | --- |
| No open critical or high **code** defects | Yes | **Met** for T7/T8/T9 code highs (closed). Toolchain npm highs stay medium/accepted. |
| Load targets met (docs/25 A5) | Yes | **Not met** — `executed: false` |
| Zero double-submit failures (wired surfaces) | Yes | **Met** for inventory/probes |
| Email checks passed (T5 allowlisted) | Yes | **Not met** |
| Lighthouse + a11y targets met | Yes | a11y scoped **pass**; marketing Lighthouse checklist **not filled** |

**Overall: NO-GO.**

---

## Open defects

| ID | Severity | Source | Note |
| --- | --- | --- | --- |
| LOAD-001 | high* (release blocker) | load | Load never executed — not a code CVE; blocks GO |
| EMAIL-001 | high* (release blocker) | T5 gap | Live allowlisted email report missing |
| SEC-005 | medium | security | Remaining npm audit highs (puppeteer/lighthouse chain) — not production runtime; **accepted (Batch C)** — `report:marketing` is tooling-only |
| SEC-006 | medium | security | `function_search_path_mutable` **fixed** (Batch B). Still open: citext in public, Auth leaked-password protection off (dashboard toggle) |
| SEC-008 | info | security | osv-scanner / gitleaks / Docker(ZAP) missing on PATH |
| GH-001 | medium | Google | Live T5 not run |
| T9 soft | low | plan-isolation | SSR cookie harness; dept/club Playwright |

\*Release-gate blockers, not necessarily exploitable CVEs.

---

## Measured capacity

| Scenario | Target (A5) | Result |
| --- | --- | --- |
| Public event page, 300 VUs / 5 min | p95 under 800 ms, errors under 1% | **Not measured** |
| Directory 50 VUs / 2 min | p95 under 800 ms, errors under 1% | **Not measured** |
| Registration / check-in / hackathon / soak | See A5 | **Not run** (later T6 groups) |

**Safe capacity:** unknown until `k6` runs against local `npm run start` with `APP_ENV=local` and a published `EVENT_ID`.

---

## Known limits

- Heavy load: **local production build only**. Never against production / `avoeline.aroxes.com`. Contact Vercel before any staging load.
- Email: real sends only to `EMAIL_TEST_ALLOWLIST`; `MAX_REAL_EMAILS_PER_RUN` default 30; `@example.test` → Mailpit/log.
- Google: Testing mode consent ~7 days; CI uses `GOOGLE_MODE=mock`.
- Security tools (ZAP/osv/gitleaks): soft-skip with `executed: false` when absent.
- CI placeholder Supabase env: Postman/authz negatives exercise Route Handler status codes; not a full multi-tenant DB matrix.

---

## How to flip to GO

1. Install k6 → `npm run build && npm run start` → `APP_ENV=local` + `EVENT_ID=<published>` → `npm run test:load:reads` → update [load-report.md](load-report.md) with p95/errors.
2. Run T5 staging live smoke (allowlisted inboxes + Google session) → write `docs/testing/live-smoke.md` with pass/fail.
3. Run `npm run report:marketing` against local `next start` and fill the marketing Lighthouse checklist.
4. Re-open this doc: set area statuses, clear LOAD-001 / EMAIL-001 / Lighthouse row, change verdict to **GO** only when the checklist table is all Met.

---

## CI (T10)

| Trigger | What |
| --- | --- |
| Every PR | Unit + integration (status CHECKs; marketing RLS if `SUPABASE_DB_URL`) + Postman negatives against ephemeral `next start` |
| Push to main/master | E2E smoke (`e2e/smoke.spec.ts`) |
| Nightly + dispatch | Security baseline + optional k6 smoke |
| Dispatch / after deploy | Read-only production smoke (`scripts/smoke-api-routes.mjs`) |

Scripts: `test:ci:postman`, `test:e2e:smoke`, `test:prod-smoke`.
