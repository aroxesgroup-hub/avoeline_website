# T0 — Safe test foundation (docs/25 Part A)

**Status:** done (pause for review before T1)

## Shipped

1. **APP_ENV / host guard** — `src/lib/testSafety.ts` + `scripts/lib/testSafety.mjs`; wired into seed/wipe scripts and Playwright config.
2. **Email guard** — `src/lib/email/emailTestGuard.ts`: allowlist + plus-aliases, `[TEST]` prefix, `MAX_REAL_EMAILS_PER_RUN`, Mailpit/log sink; wired into Resend + organizer sender.
3. **Google** — `GOOGLE_MODE` mock MSW (`src/test/google/msw/`), `googleHttp` helper; headed `npm run auth:google` → `e2e/.auth/google.json`.
4. **Seed/cleanup** — migration `is_test` + `cleanup_is_test_data`; `npm run seed:test` / `cleanup:test` (`SEED_TEST_SCALE=smoke|full`).
5. **Local stack** — `docker-compose.yml` (Mailpit + optional app), `supabase/config.toml`, `GET /api/health`, `x-request-id` on proxy + health, logger requestId.
6. **Docs** — `docs/testing/README.md`.

Allowlist addresses live only in env (not app source). Dummy volume mail: `@example.test`.
