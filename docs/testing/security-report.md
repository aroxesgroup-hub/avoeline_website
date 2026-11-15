# Security report — T7

**Targets:** local production build (`APP_ENV=local`, `http://127.0.0.1:3000`), then staging. Production and `avoeline.aroxes.com` refused.  
**Contract:** ENGINEERING_RULES S1–S19, docs/15-security-baseline (stand-in for missing docs/21), docs/25 T7.  
**Date:** 2026-11-14

| Severity | Meaning |
| --- | --- |
| critical | Exploitable authz/secret/RCE — must fix before release |
| high | Likely abuse or data exposure — fix in this program |
| medium / low | Track for T10 |

## Run status

| Workstream | Status | Notes |
| --- | --- | --- |
| Scaffold / harness | pass | `tests/security/*`, `npm run test:security*` |
| Dependencies & secrets | partial | npm audit recorded; osv-scanner + gitleaks missing on PATH (`executed` tools false); advisors recorded |
| Sessions & transport | pass | 10/10 local (`reports/security/transport.json`) |
| Authorization matrix / IDOR | pass (HTTP seed) | Unauth Route Handler probes **12/12**; expired override unit tests; live two-organizer IDOR deferred (no multi-role seed this run) |
| Postman negatives | pass (local) | Negative folder covers all Route Handlers; Newman **20/20** assertions after fixes; staging skipped |
| Abuse / business logic | pass (unit) | Price/formula, rate limit, token entropy; concurrent capacity / QR replay need seeded DB (T10) |
| Injection & content | pass | XSS/CSV/header/SSRF/maps corpus via unit tests |
| Files | pass (unit) | MIME spoof, PE sniff, path traversal names; private bucket policy unchanged |
| OWASP ZAP | not executed | `docker` not on PATH — `reports/security/zap/status.json` |
| Fix criticals/highs + re-run | done | See findings below |
| Staging | not executed | No staging `BASE_URL` / allowlist host configured — `reports/security/staging.json` |

## Findings

| ID | Severity | Area | Evidence | Fix | Re-run |
| --- | --- | --- | --- | --- | --- |
| SEC-001 | high | API | `GET /api/certificates/not-a-uuid` → 500 | UUID guard + try/catch in `src/app/api/certificates/[id]/route.ts` | authz + Newman → 400 pass |
| SEC-002 | high | API | `GET /api/events/not-a-uuid/calendar.ics` → 500 | UUID guard + try/catch in `src/app/api/events/[eventId]/calendar.ics/route.ts` | Newman + authz → 400 pass |
| SEC-003 | high | DB | Advisors: anon/auth could `EXECUTE` DEFINER `cleanup_is_test_data`, `get_marketing_insights` | `supabase/migrations/20261114180000_t7_revoke_definer_anon_execute.sql` (+ MCP apply) | Advisors: those RPCs gone from anon DEFINER list |
| SEC-004 | high | deps | npm audit: `sharp` high | Bumped `sharp@0.35.5` | audit high 11→10; remaining are lighthouse/puppeteer toolchain (accepted T10) |
| SEC-005 | medium | deps | 10 remaining npm audit highs (puppeteer/lighthouse/zod/extract-zip chain) | **Accepted (T10 Batch C)** — `report:marketing` / Playwright toolchain only; not Next runtime | Documented in release-readiness |
| SEC-006 | medium | DB | Advisors WARN: `function_search_path_mutable`, `citext` in public, leaked-password protection off; INFO×90 RLS-enabled-no-policy (service-role app pattern) | **Partial (T10 Batch B):** pinned `private.gen_registration_short_code` search_path (`20261115120000_t10_search_path_short_code.sql`). Remaining: citext public, leaked-password Auth toggle (dashboard), intentional DEFINER RPCs | Advisors: `function_search_path_mutable` **cleared** 2026-11-15 |
| SEC-007 | low | DB | `get_public_stats` DEFINER callable by anon | Accepted — intentional public aggregates | — |
| SEC-008 | info | tooling | osv-scanner / gitleaks / Docker(ZAP) not installed | Scripts record `available: false` / `executed: false` | Install tools and re-run |

### T10 appendix (2026-11-15)

- Batch B: `ALTER FUNCTION private.gen_registration_short_code() SET search_path = private, public` — advisor lint gone.
- Batch C: no dep surgery for SEC-005; treat lighthouse/puppeteer audit highs as tooling-only.

## Artifacts

- `reports/security/deps.json`
- `reports/security/transport.json`
- `reports/security/authz-http.json`
- `reports/security/postman-neg.json` / `newman-neg.json`
- `reports/security/advisors-security.json`
- `reports/security/zap/status.json`
- `reports/security/staging.json`
- Unit: `npm run test:security:unit` (40 pass)

## Staging

ZAP active and heavy abuse stay local (docs/25 A1). After configuring `APP_ENV=staging`, allowlisted `BASE_URL`, run `npm run test:security:postman` and Supabase `get_advisors` on the staging project; record separately here.
