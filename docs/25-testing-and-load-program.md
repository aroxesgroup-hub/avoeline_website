# Avoeline testing, load and security program

Goal: prove the whole product works, survives bursts, resists abuse and sends the right emails, before attendees use it. Eleven prompts (T0 to T10), one fresh chat each, with `@docs/ENGINEERING_RULES.md` and this file. Test tools: **Vitest** (unit and integration), **Playwright** (browser journeys), **Postman** via your Cursor Postman MCP (API collections and contract and security checks), **k6** (load), **OWASP ZAP** (security scan), **Mailpit** (email sink).

---

## Part A. Read this first (safety and decisions)

### A1. Where each kind of test runs
| Environment | Use |
|---|---|
| **Local** (Docker Supabase plus `next build && next start`) | Everything, including heavy load. Finds code and database bottlenecks without touching any provider |
| **Staging** (a separate Supabase project plus a Vercel preview or staging deployment) | Real-service checks, small announced load, live Google and real-inbox smoke tests |
| **Production** (`avoeline.aroxes.com`) | Never load or security tested. Only a read-only smoke test after launch |

**Vercel:** <cite index="105-1">running a load test without prior warning is likely a breach of their fair usage policy, and the test's IP addresses will probably be blocked shortly after starting.</cite> <cite index="104-1">Vercel also notes the real bottleneck is usually the APIs and databases behind your code, so load-test those directly.</cite> So: run the heavy tests **locally against a production build**, and for the Vercel staging deployment contact Vercel support first and keep the test modest.

### A2. Emails: sink first, real inboxes sparingly
- In every non-production environment, mail goes to **Mailpit** (a local inbox that catches everything) unless the recipient is on `EMAIL_TEST_ALLOWLIST`. That list holds only your three addresses: `sheharyarrana2003@gmail.com`, `eventflow355@gmail.com`, `muhammadsheharyarshahzadrana@gmail.com`. Use Gmail plus-addresses (for example `sheharyarrana2003+t1@gmail.com`) to make unique test attendees that all arrive in the same inbox.
- Dummy attendees at volume use `@example.test` (never delivered) and go to the sink.
- Real sends are capped per run (for example 30) so Gmail and Resend limits and your Google app's reputation stay safe. **Never send load-test volume to real inboxes.**

### A3. "Continue with Google" using avoeline@gmail.com
Google blocks automated sign-ins, and you should never give Cursor your password. Do this: **you** sign in with Google once by hand in a Playwright browser window, approve the consent screen, and save the session locally (`.auth/`, gitignored). Tests reuse that saved session. Your app is in Google **Testing** mode, so the connection expires every 7 days and you repeat the manual login. In automated and CI runs Google is **mocked**; live Google checks (T5) are manual-assisted.

### A4. Plans without Vendors, Ushers or AI Designer
Yes, you can create a plan that leaves them out in the Plans admin. T9 proves that an organizer on that plan **doesn't see them in navigation, can't open them by URL, and gets a 403 from the API**.

### A5. What "survive" means (defaults, tune to your staging size)
| Scenario | Target |
|---|---|
| Public event page, 300 concurrent visitors for 5 minutes | p95 under 800 ms, errors under 1% |
| Spike: 0 to 500 visitors in 10 seconds | No crash, errors under 2%, recovers within 30 seconds |
| **Burst: 300 registration attempts in 10 seconds** into a 100-seat event | No 5xx, **exactly the right number accepted**, no oversell, no duplicates, correct waitlist, p95 under 2 s |
| Check-in: 20 scanners at 5 scans per second, with double scans | Each ticket checked in once, counters exact |
| Hackathon: 300 teams submit within 60 seconds, 500 clients polling the scoreboard | No lost submissions, scoreboard correct and within 15 s |
| Mixed soak: 50 users for 30 minutes | Flat memory and latency, zero errors |
After any run: counts in the UI must equal rows in the database (registrations, capacity, check-ins, offers used, emails queued).

### A5b. The tools' roles
**Postman** (through the MCP and the Postman CLI) holds the API collections: functional, contract and negative security tests. <cite index="106-1">The Cursor Postman integration can run a collection with the Postman CLI and report the results.</cite> **k6** does load (Postman isn't a load tool). Collections live in `tests/postman/` in the repo, with environment files that contain no secrets.

---

## Part B. Prompts

### T0. Environments, safety rails and test data

````text
Read @docs/ENGINEERING_RULES.md and docs/25 Part A. Build the safe test foundation. Never put secrets in code or chat; use env files and password managers.
1. APP_ENV (local, staging, production). Every test, seed and load script refuses to run when APP_ENV is production or the target host isn't on an allowlist.
2. EMAIL: in non-production, a sender guard sends real mail ONLY to addresses on EMAIL_TEST_ALLOWLIST (my three addresses and their plus-aliases) and routes everything else to Mailpit (local) or a log sink. Add MAX_REAL_EMAILS_PER_RUN (default 30) and a [TEST] subject prefix. Dummy attendees use @example.test.
3. GOOGLE: GOOGLE_MODE=mock|live. Mock server (msw) for Gmail, Calendar, Drive and OAuth for CI and local runs. Live mode reuses a connection I create manually. Provide a Playwright script that opens a headed browser so I can sign in with Google myself and saves storageState to .auth/ (gitignored). Never ask for or store a Google password.
4. SEED SCRIPTS (deterministic, faker, every row marked is_test): users and roles (platform owner, staff, department admin, club president, organizer on three plans, vendor), plans (Full; "Social Lite" without Vendor Store, Ushers and AI Designer; "Hackathon"), events (a 5,000-capacity concert, a free workshop, a hackathon with 14 competitions and 300 teams, a private event, an invite-only event), 5,000 dummy attendees, offers, certificates templates. Plus a cleanup script.
5. Local stack: docker-compose for Supabase local, Mailpit, and a production build (next build then next start). Health endpoint, request ids in logs.
6. docs/testing/README.md: how to run each layer, what each environment is for, and a checklist for the manual Google login.
Pause for review.
````

### T1. Inventory, test matrix and Postman collection

````text
Read @docs/ENGINEERING_RULES.md and docs/25. READ-ONLY except docs/testing/ and tests/postman/.
1. Inventory every app route, API route, server action, webhook, cron job and background worker with its auth requirement.
2. Produce docs/testing/test-matrix.md: feature x role x layer (unit, integration/API, E2E, load, security) with the risk level (money, auth, data exposure, volume) and what is covered or missing. Rank gaps.
3. Using the Postman MCP: create a workspace collection "Avoeline API" in tests/postman/ with folders per domain, staging and local environment files (no secrets), auth variables for each role, and a generated OpenAPI spec from the zod schemas so requests and contract checks stay in sync. Each request has tests for status, response schema and timing.
Pause for review.
````

### T2. Unit tests

````text
Read @docs/ENGINEERING_RULES.md and docs/testing/test-matrix.md. Write Vitest unit tests for all pure logic, with edge cases, and set coverage gates (90% lines and branches on pricing, offers, permissions, registration state, capacity and quota math).
Cover: getRegistrationState (all states, timezone boundaries), priceRegistration and offers (one offer, no stacking, scope, eligibility, rounding), can() and hasModuleAccess (plans, overrides, expiry), short codes and QR token sign and verify, form schema builder from field definitions, certificate renderer and tokens (long and non-Latin names), rate limiter, email template rendering (escaping, plain-text part, one ticket link, QR count), ledger totals, scoreboard calculation and movement, settings resolver, CSV import validators, date and money utils, access-gate logic for each access type, capacity and rolling-window quota math.
Add mutation testing (Stryker) on pricing, permissions and registration state, and fix weak tests until the mutation score is acceptable. Report surviving mutants.
Pause for review.
````

### T3. Integration and API tests (Vitest plus Postman)

````text
Read @docs/ENGINEERING_RULES.md, docs/testing/test-matrix.md and the Postman collection. For every API route and server action, test against the local Supabase and run the Postman collection with the Postman CLI.
For each endpoint: happy path, every validation error, wrong or missing auth (anonymous, wrong role, another tenant's id), idempotency (same request twice), rate limiting, response schema contract, and no sensitive field in the response.
Domains: auth and onboarding, tenants and temp-password creation, plans and overrides, events and wizard, public event DTO (no forbidden fields), registration (single, group, hackathon), offers and promo codes, access gates and invites, payment proofs and the file proxy, attendees and exports, teams, recruitment and access grants, hackathon (tasks, flags, submissions, judges, scoreboard), certificates, email outbox with the fake sender, Resend webhook signature, connections with mocked Google, admin and CMS, public stats, directory and profiles.
Add SQL tests for RLS on every table (each role reads and writes only what it should). Run the collections in CI with the Postman CLI and fail the build on any failed test.
Pause after each two domains.
````

### T4. End-to-end journeys (Playwright)

````text
Read @docs/ENGINEERING_RULES.md and docs/25. Write Playwright journeys that run against the local production build with Mailpit (and GOOGLE_MODE=mock), and assert emails through the Mailpit API.
J1 SaaS OWNER: create organizer, department and vendor accounts; the temporary-password email arrives; first login forces a password change and the old password then fails; the invite-link option; create plan "Social Lite", assign it, billing and bank details, overrides, approvals, moderation, support ticket with an attachment.
J2 DEPARTMENT: add a club and president (invite email), add a tenure, announcement (in-app and email), analytics, read-only club events.
J3 CLUB PRESIDENT: teams and roles, recruitment form and public apply link, applicant, shortlist, interview invite, onboard, access grant, then log in as the new member and see only the granted tabs.
J4 ORGANIZER SIGN-UP: sign up, choose a plan, onboarding steps, welcome email, connect Google (mocked), create the first event.
J5 SOCIAL EVENT (concert): create, publish, public page, solo registrations with tiers and offers, payment proof, approve, confirmation email with ONE ticket link and the QR, check-in, export, capacity and waitlist.
J6 HACKATHON: several competitions, offers, team registration (lead plus 3 members), the lead's email contains 4 QR codes with no duplicates, phases and tasks, participant portal, flag and file submission, scoreboard, judge invite and accept, certificates.
J7 ACCESS TYPES: public, private (gate page with code and whitelist), invite-only (email confirmation), hybrid and VIP/tiered.
J8 CERTIFICATES: edit a template (drag, resize, keyboard), issue, email, download, verify.
J9 DISCOVERY: directory filters, Near me (mocked geolocation), trending order, organizer profile.
J10 MARKETING SITE: every page loads, plan changes in the admin appear on the Plans page, contact form reaches the inbox.
J11 FAILURE MODES: Drive disconnected uses the fallback, Google token revoked blocks organizer email with the held-emails flow, Resend down, slow database.
Every journey records a trace and screenshots. Fix defects found (not new features) and re-run.
Pause after J1-J4, again after J5-J8, again after J9-J11.
````

### T5. Real inbox and live Google smoke (manual-assisted)

````text
Read docs/25 Part A2-A3. Build docs/testing/live-smoke.md and Playwright scripts for a small live run against STAGING. Preconditions: I have signed in with Google manually as avoeline@gmail.com and saved .auth/. Stay under MAX_REAL_EMAILS_PER_RUN.
Scenarios and what to verify in the three allowlisted inboxes (use plus-aliases for unique attendees):
1. Registration received, then confirmed: the right From, Reply-To, content and design, one ticket link, QR inline, works in Gmail web and mobile.
2. Team registration: the lead gets one email with every member's QR, no duplicate emails or QRs, member emails only if the toggle is on.
3. Private-event code, invite-only invitation, VIP invitation: the designed invite card and the working personal link.
4. Custom email to one person and a bulk email to a 3-recipient filter, with the composer checkboxes (team name, members, competition) reflected.
5. Certificate email with the download link.
6. Platform mail: temporary-password email, plan changed, tenant approved, announcement, contact-form notification. Check SPF, DKIM and DMARC pass in the message source.
7. Gmail connection: connect, send test, see the message in Sent, disconnect, confirm the token is revoked.
8. Calendar and Meet: create a test event with a Meet link and clean it up. Drive: a payment proof lands in the organizer's Drive folder and the fallback works when disconnected.
Produce a pass/fail report with screenshots and the headers checked.
````

### T6. Concurrency and load (k6) with a fix loop

````text
Read @docs/ENGINEERING_RULES.md and docs/25 Part A1 and A5. Run against the LOCAL production build first. For Vercel staging, stop and ask me to notify Vercel before any run, and keep it small.
1. k6 scripts in tests/load/ for: public event page reads (ISR and cache behavior), registration burst (300 attempts in 10 s into a 100-seat event, with waitlist on and off, solo and team, with payment proof uploads of small images), the offers and promo code path, check-in with double scans, approvals under load, the hackathon submission burst, scoreboard polling by 500 clients, the registration counters updating continuously while organizers watch the dashboard, directory and trending queries, and a mixed 30-minute soak. The email path uses the fake sender with configurable speed.
2. Assertions after each run: no 5xx beyond target, no oversell, no duplicate registrations (idempotency keys), counters equal database rows, exactly the expected waitlist, emails queued exactly once per registration and kind, no lost submissions.
3. Observe: database connections and the pooler (use the transaction-mode pooler for serverless), slow queries (pg_stat_statements), lock waits, CPU, memory, function durations and cold starts, rate-limit behavior (the store must be shared across instances, not in memory).
4. Fix what breaks, then re-run. Likely fixes: atomic capacity and counter updates (a single UPDATE with the limit in the WHERE clause, never read-modify-write), unique constraints plus client request ids for idempotency, FOR UPDATE SKIP LOCKED for the email outbox, a shared rate-limit store, limiting image-processing concurrency or moving it to a queue, cached aggregates and ETags for the scoreboard instead of per-client queries, caching and revalidation for public pages and the directory, missing indexes, N+1 queries, and graceful degradation (429 with Retry-After and a friendly "high demand, try again" message instead of crashes).
5. Write docs/testing/load-report.md: scenarios, thresholds, results before and after fixes, bottlenecks found, and the safe capacity you measured.
Pause after each scenario group.
````

### T7. Security testing

````text
Read @docs/ENGINEERING_RULES.md, docs/21 and docs/25. Run on local and staging only.
1. Authorization matrix tests (every role x every route and API), including IDOR with two organizers' data, a club reading another club's data, staff beyond their grants, and expired overrides.
2. OWASP ZAP baseline and active scans of the local app; triage findings.
3. Abuse and business-logic tests: negative or tampered prices, offer stacking and reuse, capacity oversell, replaying a QR or check-in, reusing or forging invite links and tickets, bypassing payment states, brute-forcing access codes, invite confirmation and logins (rate limits and lockouts hold), double-submit.
4. Injection and content tests: an XSS and HTML-injection payload corpus in every text field (titles, descriptions, form answers, team names, announcements, custom email bodies) checked on the public page, the organizer views, emails and exports (CSV and formula injection); SQL injection through every filter; SSRF through maps, livestream and URL fields; open redirects; header injection in email fields.
5. Files: upload type spoofing, oversized files, executable and archive tricks, SVG scripts, path traversal in names, and that private files never become public.
6. Sessions and transport: cookie flags, CSRF on state-changing routes, CORS, security headers and CSP, token and secret leakage in responses and logs.
7. Dependencies and secrets: npm audit, osv-scanner, gitleaks including history, Supabase security advisor.
8. Postman: a negative-testing folder for every endpoint (missing auth, wrong role, malformed, oversized, replayed).
Write docs/testing/security-report.md with severity, evidence and fixes. Fix criticals and highs, add regression tests, re-run.
````

### T8. Button, UI and accessibility sweep (double-tap protection)

````text
Read @docs/ENGINEERING_RULES.md and docs/25. Build a Playwright sweep over every screen and role.
1. DOUBLE-TAP HARNESS: a helper assertSingleSubmit(page, buttonLocator, apiMatcher) that double-clicks, clicks five times rapidly and presses Enter twice, then asserts the button is disabled or aria-busy while pending, exactly one request or one side effect occurred (verify the database row count), and that the UI recovers after an error. Apply it to EVERY button and form with a side effect: registration, approve and reject, check-in, offers apply, invite send, email send, certificate issue, tenant create, plan change, payments, uploads, deletes, publish. Also add server-side protection (client request ids and idempotency) for every mutating action, so a missed UI guard can't create duplicates.
2. Every screen: loading, empty, error and success states; validation messages next to fields; focus management and Escape in modals; keyboard-only paths; axe accessibility checks; contrast.
3. Responsive screenshots at 390, 768, 1280 and 1536 px in light and dark; visual regression baselines for the main pages; a link crawler for broken links and 404s; zero console errors or hydration warnings.
4. Report defects, fix them, re-run.
````

### T9. Plan gating and tenant isolation

````text
Read @docs/ENGINEERING_RULES.md, docs/04-organizer.md and docs/25 Part A4. Test thoroughly:
1. Create plans in the admin: "Social Lite" (no Vendor Store, no Ushers, no AI Designer), a plan with only some modules, and Full. For an organizer on each plan verify: the navigation hides excluded modules, direct URLs show an upsell or 403, every API for the module returns 403, tabs inside events respect the plan, the public site and emails don't mention them, and downgrading mid-way keeps data but blocks use.
2. Overrides: grant and deny, expiry at read time, interaction with plan changes.
3. Tenant isolation: organizer A can never read or write organizer B's events, registrations, files, emails, connections or exports; same for departments and clubs; vendors see only their own bookings.
4. Add the matrix as automated tests and fix any leak.
````

### T10. Reporting, fix loop and release gate

````text
Read all reports in docs/testing/. Produce docs/testing/release-readiness.md: pass or fail per area (unit, integration, API, E2E, email, Google, load, security, UI sweep, accessibility), open defects by severity, measured capacity, known limits, and a go or no-go checklist (no open critical or high defects, load targets met, zero double-submit failures, email checks passed, Lighthouse and accessibility targets met). Set up CI: unit and integration and Postman on every pull request, E2E smoke on every merge, security baseline and k6 smoke nightly on the local stack, and a read-only production smoke test after each deploy. Fix remaining defects in batches (smallest safe change, regression test each, stop between batches).
````

---

## Decisions for you
1. **Load testing on Vercel:** contact Vercel support before any staging run, or only test locally and add a very small announced run later.
2. **Gmail limits:** real sends capped at 30 per run. Raise only if you're sure about the limits.
3. **Production smoke test:** a few read-only checks after each deploy. Say if you'd rather not have any.
