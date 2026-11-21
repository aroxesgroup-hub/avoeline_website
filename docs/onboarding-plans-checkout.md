# Onboarding, plans, and bank checkout

## Self-serve funnel (organizer + vendor)

1. **Sign up wizard** — `/auth/signup?plan=&billing=month|year&role=Organizer|Vendor`
   - Step 1: account type (Organizer / Vendor / Attendee)
   - Step 2: email/password or Continue with Google (role passed into OAuth metadata)
   - Intent cookie `avoeline_signup_intent` stores `{ plan, billing, role }` for ~1 hour
2. **Verify email** — required before profile/plan (Google accounts are verified by Auth).
3. **Profile** — organizer org/logo details or vendor business details (`/auth/signup/organizerSetup` | `vendorSetup`).
4. **Plan** — themed `PlanSelectStep` preselects linked plan; billing period honored.
   - **Free** → profile pending → `/auth/signup/awaiting-approval` until tenant Approvals.
   - **Paid** → bank details (from `/admin/settings/billing`) + screenshot → awaiting payment approval. Amount = `price_yearly` when `billing=year`, else `price_monthly`.
5. **Owner approves payment** — `/admin/billing/pending` → plan activated + profile approved + email.
6. **Password later** — Google users can set a password at `/auth/change-password?optional=1` so next visit can use email/password. Forgot password: `/auth/forgot-password` → `/auth/reset-password`.

Attendees skip plan/payment and go to the attendee dashboard after signup.

Admin-created tenants (`/admin/tenants/new`) still support department / organizer / vendor and assign plans immediately.

## Marketing → signup

`/plans` CTAs use `/auth/signup?plan=<key>&billing=month|year&role=Organizer` (`withBillingPeriod` in `marketingData.logic.ts`). Enterprise cards go to `/contact?topic=enterprise`.

## Google OAuth setup

1. Supabase Dashboard → Authentication → Providers → Google: enable and add Client ID/Secret.
2. Authorized redirect URL: `https://<your-domain>/auth/callback` (and local `http://localhost:3000/auth/callback`).
3. **Supabase → Authentication → URL Configuration:** set **Site URL** to the live origin (e.g. `https://avoeline.aroxes.com`), not `http://localhost:3000`. Add `/auth/callback` and `/auth/reset-password` to **Redirect URLs**.
4. Deploy env: `NEXT_PUBLIC_SITE_URL=https://avoeline.aroxes.com` (no trailing slash) so OAuth `redirectTo` matches production.
5. Signup wizard passes selected account type into Google OAuth.

## Bank details

Owner edits platform bank / JazzCash / EasyPaisa at `/admin/settings/billing`. Those values appear on paid-plan checkout.

## Plans

- `/admin/plans` — audience `organizer` | `vendor` | `both`, modules, pricing (`price_monthly` / `price_yearly`).
- Vendor starter keys: `vendor_free`, `vendor_pro` (edit anytime).
- Organizer plans keep existing keys (`free`, etc.).

## Env

No new required secrets beyond existing Supabase + Resend. Google Auth is configured in the Supabase project, not only in `.env`.
