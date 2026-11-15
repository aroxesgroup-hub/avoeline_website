# Test matrix — load + security + plan isolation + release gate (T6 / T7 / T9 / T10)

Feature × layer. Load cells from docs/25 A5; security cells from T7; plan/tenant from T9; gate from T10. See [load-report.md](load-report.md), [security-report.md](security-report.md), [plan-isolation-report.md](plan-isolation-report.md), [release-readiness.md](release-readiness.md).

| Feature | Role | Layer | Risk | Coverage |
| --- | --- | --- | --- | --- |
| Public event page | guest | load | volume | Scripted in `tests/load/public-event.js` (300 VUs, 5 min, p95 < 800 ms, errors < 1%). Run not executed — see [load-report.md](load-report.md). |
| Directory search (`/events`, `?q=`) | guest | load | volume | Scripted in `tests/load/directory.js` (50 VUs, 2 min). Run not executed. |
| Registration burst | guest | load | money | Not run. Later T6 pause. |
| Check-in | staff | load | data | Not run. Later T6 pause. |
| Hackathon submit / scoreboard | guest | load | volume | Not run. Later T6 pause. |
| Mixed soak | mixed | load | volume | Not run. Later T6 pause. |
| Route Handlers (unauth / malformed) | guest | security | authz | `tests/security/authz-http.mjs` + Postman Negative — local pass |
| Headers / CSP / CORS / leak denylist | guest | security | transport | `tests/security/transport.mjs` — 10/10 local |
| XSS / CSV / SSRF / upload spoof | n/a | security | injection | `tests/security/__tests__/*` corpus — unit pass |
| npm audit / advisors / secrets | n/a | security | deps | `deps.mjs` + MCP advisors; osv/gitleaks/ZAP not executed |
| Abuse (prices, rate limit, tokens) | n/a | security | abuse | Unit pass; live capacity/QR IDOR deferred |
| Double-tap / pending | guest/organizer | ui | money/data | `assertSingleSubmit` + `client_request_ids` — see [ui-sweep-report.md](ui-sweep-report.md) |
| Axe / contrast | guest/organizer | ui | a11y | `e2e/t8/screens/*` |
| Visual light/dark | guest | ui | visual | 390/768/1280/1536 baselines |
| Link crawl | guest | ui | links | `e2e/t8/crawler.spec.ts` |
| Plan Social Lite nav/URL | organizer | plan | gating | `e2e/t9/plan-gating.spec.ts` — Marketplace/Designer/Ushers hidden + LockedModulePanel |
| Plan Partial / Full | organizer | plan | gating | Partial certs OK / vendor locked; Full unlocked — Playwright |
| Overrides grant/expiry | organizer | plan | gating | `tests/security/authz-tenant.mjs` + `resolveModuleAccess.test.ts` |
| Event Vendors / booking MODULE | organizer | plan | gating | Layout gate + `createBookingFromForm` / external vendors / `assertEventActor` |
| Cert / hackathon MODULE | organizer | plan | gating | `issueCertificates` MODULE + hackathon tabs in `assertEventActor` |
| Designer / Ushers API | organizer | plan | gating | N/A (page lock only; no mutating RH) |
| Vendor booking IDOR | vendor | isolation | authz | Playwright + page `notFound` when vendor mismatch |
| Public event locked CTA | guest | plan | gating | authz-tenant public HTML + Playwright |
| Tenant org A≠B bookings | vendor/org | isolation | authz | seed fixtures + DB row assert in authz-tenant |
| Release gate | n/a | release | gate | [release-readiness.md](release-readiness.md) — **NO-GO** (load/email/Lighthouse) |
| CI PR Postman | guest | api | authz | `.github/workflows/ci.yml` after `next start` |
| CI merge E2E smoke | guest | e2e | smoke | `test:e2e:smoke` on push main |
| CI nightly security/k6 | mixed | security/load | baseline | `nightly-local.yml` |
| Prod read-only smoke | guest | api | smoke | `prod-smoke.yml` / `test:prod-smoke` |
