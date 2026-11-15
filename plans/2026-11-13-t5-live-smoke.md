# T5 — staging live smoke

**Status:** done (scripts and docs; the staging run itself is manual-assisted)

## Shipped

1. **Guard** — Playwright project `live-smoke`. `npm run test:e2e:live-smoke` requires `APP_ENV=staging`, `GOOGLE_MODE=live`, and a staging `PLAYWRIGHT_BASE_URL` on the host allowlist. Host `avoeline.aroxes.com` is refused. The default `npm run test:e2e` does not include this project.
2. **Budget** — The runner counts real sends and stops before `MAX_REAL_EMAILS_PER_RUN` (default 30). The scripted plan is 19 sends to plus-aliases of the three allowlisted inboxes.
3. **Sessions** — `npm run auth:google` remains the app session. `npm run auth:gmail` saves `e2e/.auth/gmail-1.json` through `gmail-3.json` after you sign in. No password is stored.
4. **Scenarios** — `e2e/live-smoke/live-smoke.spec.ts` covers registration, team QR mail, access invites, composer bulk send, certificate mail, platform mail, Gmail connect/revoke, and Calendar/Meet plus Drive fallback.
5. **Report** — `reports/live-smoke/report.md` plus screenshots and Authentication-Results text. Gitignored. Empty shape: `reports/live-smoke/report.template.md`. How to run: `docs/testing/live-smoke.md`.

## Not this slice

Executing the staging run. That needs the staging origin and the saved sessions on this machine.
