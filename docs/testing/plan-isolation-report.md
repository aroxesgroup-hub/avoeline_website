# Plan gating & tenant isolation report (docs/25 T9)

**Date:** 2026-11-15  
**Target:** local only (`APP_ENV=local`, `http://127.0.0.1:3000`)  
**Seed:** `npm run seed:test` → `reports/security/t9-seed-summary.json`  
**Harness:** `npm run test:plan-gating` → `reports/security/authz-tenant.json`  
**E2E:** `npm run test:e2e:t9` (Playwright project `t9-plan`)

---

## Verdict

**Pass for critical/high leaks found in-session.** Plan matrix, override expiry, vendor booking IDOR, and Social Lite nav/URL locks are automated. Soft HTTP cookie probes defer to Playwright (SSR auth cookies). Medium/low follow-ups → T10.

---

## Fixtures

| Role | Email | Plan | Fixed UUID |
| --- | --- | --- | --- |
| Organizer | `org.social@avoeline.test` | `social_lite` | `11111111-…1101` |
| Organizer | `org.partial@avoeline.test` | `partial_ops` | `11111111-…1102` |
| Organizer | `org.full@avoeline.test` | `full` | `11111111-…1103` |
| Isolation A/B | `org.a@` / `org.b@avoeline.test` | `full` | `…1104` / `…1105` |
| Vendors | `vendor.a@` / `vendor.b@avoeline.test` | `vendor_free` | `…1106` / `…1107` |

Password: `DEMO_SEED_PASSWORD` / `SEED_TEST_PASSWORD` (not printed). Cleanup: `npm run cleanup:test`.

---

## Findings

| Sev | Finding | Evidence | Fix | Re-run |
| --- | --- | --- | --- | --- |
| High | Event Vendors tab + booking writes ignored `vendor_store` | Layout always showed Vendors; `createBookingFromForm` / external vendor actions ungated | Gate layout tab + page `LockedModulePanel`; `hasModuleAccess` in bookings + external vendors + `assertEventActor` vendors tab | Playwright Social Lite event vendors locked; unit source regression |
| High | Vendor booking detail IDOR | `/vendor/{A}/bookings/{B}` could render B’s booking | Require URL vendor == booking.vendorId and session vendor (or support viewer) else `notFound` | Playwright IDOR pass |
| Med | Hackathon mutations via `assertEventActor` without module | Owner path returned event before plan check | `eventPassesModuleGate` for competitions/tasks/… + certificates | Source regression + Partial plan includes `hackathon_ops` |
| Info | Designer / Ushers | No dedicated mutating Route Handlers | Page `LockedModulePanel` only; API row **N/A** | Playwright lock/unlock |
| Info | SSR cookie probes in `authz-tenant.mjs` | Soft-skipped when 307 → signin | Playwright owns authenticated HTML | Harness 12/12 hard rows |

---

## Matrix results (local)

### Unit

- `resolveModuleAccess.test.ts` — 11/11 (deny/grant/expiry/plan/inactive/club/org)
- `moduleGates.regression.test.ts` — 4/4 (cert MODULE, booking vendor_store, assertEventActor, IDOR)

### `test:plan-gating` (executed: true)

- Social Lite plan denies `vendor_store` / `ushers_ops` / `ai_designer`
- Partial has certificates, not vendor/designer
- Full has paid trio
- Override grant insert + live + expired
- Public event HTML has no “Activate Vendor Store / AI Designer”
- Vendor bookings A≠B in DB
- Soft: authenticated page probes (Playwright coverage)

### Playwright `test:e2e:t9` — 4/4

- Social Lite: nav hides marketplace/designer/ushers; direct URLs show Activate panels; event Vendors/Certificates tabs hidden; public page clean
- Partial: certificates unlocked; marketplace locked
- Full: marketplace/designer/ushers without Activate
- Vendor A cannot open Vendor B booking

---

## How to re-run

```bash
npm run seed:test
npm run build && npm run start   # separate terminal
$env:APP_ENV="local"
npm run test:plan-gating
npm run test:e2e:t9
node --import tsx --test src/features/permissions/__tests__/resolveModuleAccess.test.ts src/features/permissions/__tests__/moduleGates.regression.test.ts
```

---

## Open → T10

- Authenticated fetch harness with real `@supabase/ssr` cookie chunks (optional; Playwright covers HTML)
- Dept/club orgScope cross-tenant Playwright (service `canManageOrg` already used by ownership)
- Live certificate `issueCertificates` action call under Social Lite (source + MODULE path covered)
- Designer/Ushers mutating APIs if added later — must call `hasModuleAccess`
