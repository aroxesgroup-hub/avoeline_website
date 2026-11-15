# Testing — local foundation (docs/25 T0)

How to run each safety layer. Full program: [docs/25-testing-and-load-program.md](../25-testing-and-load-program.md). Engineering rules: [docs/ENGINEERING_RULES.md](../ENGINEERING_RULES.md).

**Never put secrets in chat or source.** Use `.env.local` and a password manager.

---

## Environments

| Environment | Purpose |
| --- | --- |
| **Local** | Docker/Supabase CLI + Mailpit + `next build && next start`. Unit, e2e, heavy load, mocks. |
| **Staging** | Separate Supabase + Vercel preview. Small real-inbox / live Google smoke (T5). |
| **Production** | Read-only smoke only. Seeds, wipe, load, and destructive scripts **refuse** when `APP_ENV=production` or the target host is not on `TEST_HOST_ALLOWLIST`. |

---

## Safety rails

| Variable | Role |
| --- | --- |
| `APP_ENV` | `local` \| `staging` \| `production` |
| `TEST_HOST_ALLOWLIST` | Comma hosts for seeds/e2e (default `localhost,127.0.0.1`) |
| `EMAIL_TEST_ALLOWLIST` | Comma addresses allowed for **real** mail in non-prod (plus-aliases match) |
| `MAX_REAL_EMAILS_PER_RUN` | Cap real allowlisted sends per process (default `30`) |
| `GOOGLE_MODE` | `mock` (MSW) or `live` (manual connection) |

Subjects in non-prod get a `[TEST]` prefix. Volume dummies use `@example.test` and always go to Mailpit/log — never real delivery.

---

## Local stack

```bash
# 1) Database (Supabase CLI owns containers)
npm run stack:db          # npx supabase start
npx supabase db reset     # apply migrations (includes is_test)

# 2) Mailpit
npm run stack:up          # or: npm run mailpit

# 3) App — production build locally (preferred for load)
npm run build && npm run start
# optional: docker compose --profile app up --build

# Health
curl -s http://127.0.0.1:3000/api/health
```

Request ids: `x-request-id` on proxy-matched routes and `/api/health`; logger attaches `requestId` when ALS/context is set.

---

## Seeds

| Script | Command | Notes |
| --- | --- | --- |
| Light demo | `npm run seed:demo` | `*@avoeline.demo`, capped |
| Owners | `npm run seed:owners` | From `SAAS_OWNER_*` env |
| **T0 / T9 test** | `npm run seed:test` | `is_test=true`, plans `social_lite` / `partial_ops` / `full`, three organizers + isolation peers + vendors; writes `reports/security/t9-seed-summary.json` |
| Cleanup test | `npm run cleanup:test` | Deletes `is_test` rows + `@avoeline.test` / `@example.test` Auth users |
| Full wipe | `CONFIRM=YES npm run reset:wipe-data` | Also blocked when `APP_ENV=production` |

---

## Email

1. Start Mailpit (`npm run mailpit`).
2. Set `MAILPIT_SMTP_URL=smtp://127.0.0.1:1025` (and optionally `EMAIL_TRANSPORT=mailpit`).
3. Put real inboxes only in `EMAIL_TEST_ALLOWLIST` (see docs/25 Part A2 — do not commit them in app code).
4. Open http://localhost:8025 to inspect sink mail.

---

## Google mock vs live

- **Mock (default non-prod):** `GOOGLE_MODE=mock`. MSW handlers: `src/test/google/msw/`. Start in tests via `startGoogleMockServer()`.
- **Live:** `GOOGLE_MODE=live`. Create the Google connection yourself in the UI. Never paste a Google password into Cursor.

### Manual Google login checklist (`npm run auth:google`)

1. App running locally (`npm run start` or `dev`).
2. `APP_ENV=local` and host allowlisted.
3. Run `npm run auth:google` — a **headed** Chromium window opens.
4. **You** sign in with Google and approve consent (password stays in the browser only).
5. When the URL reaches a dashboard (or press Enter in the terminal), session is written to `e2e/.auth/google.json` (gitignored).
6. Google **Testing** mode expires consent about every **7 days** — re-run this script.
7. Never commit `.auth/` or share storageState files.

---

## Unit tests (foundation)

```bash
node --import tsx --test \
  src/lib/__tests__/testSafety.test.ts \
  src/lib/email/__tests__/emailTestGuard.test.ts \
  src/test/google/msw/__tests__/handlers.smoke.test.ts
```

Or `npm run test:unit` (includes these).

Marketing Lighthouse (`npm run report:marketing`) is **tooling-only** (puppeteer/lighthouse). Remaining npm audit highs on that chain are accepted as SEC-005 — not the Next.js production runtime.

---

## Load — read path (T6 group 1)

Local production build only. No Vercel run.

```bash
npm run build
npm run start
$env:APP_ENV="local"
$env:EVENT_ID="<published-event-uuid>"
npm run test:load:reads
```

Scripts: [tests/load/README.md](../../tests/load/README.md). Results: [load-report.md](load-report.md). The runner refuses `APP_ENV=production` and `avoeline.aroxes.com`.

---

## Security (T7)

Local first (`APP_ENV=local`), then staging only. Refuses production and `avoeline.aroxes.com`.

```bash
npm run build && npm run start
$env:APP_ENV="local"
$env:BASE_URL="http://127.0.0.1:3000"
npm run test:security:unit
npm run test:security:transport
npm run test:security:authz
npm run test:security:postman
npm run test:security:deps
npm run test:security:zap   # needs Docker
```

Report: [security-report.md](security-report.md). Harness: [tests/security/README.md](../../tests/security/README.md).

---

## UI sweep (T8)

Double-tap, axe, visual, crawler. Local production build + `seed:demo`.

```bash
npm run build && npm run start
$env:APP_ENV="local"
npx playwright test --project=setup
npm run test:e2e:t8
# or: test:e2e:t8:double-tap | :a11y | :visual | :crawl
```

Report: [ui-sweep-report.md](ui-sweep-report.md). Helpers: `e2e/helpers/assertSingleSubmit.ts`.

---

## Plan gating & tenant isolation (T9)

Local production build + `npm run seed:test`. Refuses production / blocked hosts via `testSafety`.

```bash
npm run seed:test
npm run build && npm run start
$env:APP_ENV="local"
npm run test:plan-gating
npm run test:e2e:t9
node --import tsx --test src/features/permissions/__tests__/resolveModuleAccess.test.ts src/features/permissions/__tests__/moduleGates.regression.test.ts
```

Report: [plan-isolation-report.md](plan-isolation-report.md). Matrix rows in [test-matrix.md](test-matrix.md).

---

## Release readiness (T10)

Gate document: [release-readiness.md](release-readiness.md) (**NO-GO** until load + live email + Lighthouse checklist clear).

```bash
# Local re-check of gates you can run without staging
npm run test:unit
npm run test:security:unit
# After k6 install + EVENT_ID:
npm run test:load:reads
# After deploy (read-only):
npm run test:prod-smoke
```

CI: PR unit/integration/Postman; merge E2E smoke; nightly security + k6; `prod-smoke.yml` for production GETs.

---

## Pause

T0 stops here for review before T1 (inventory / Postman matrix).
