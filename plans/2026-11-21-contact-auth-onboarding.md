# Contact mock + themed auth/onboarding

**Status:** done  
**Date:** 2026-11-21

## Goal

Rebuild `/contact` to the editorial desk mock under CMS + mint/emerald tokens, and harden signup → plan → bank screenshot → admin approval with themed AuthShell, plan deep-links, Google+password continuity, and forgot/show password.

## Done

- Contact: `support_tiers` + `contact_hub` blocks; form `organization`/`expedited`; seed + `revalidate=60`
- AuthShell marketing chrome; sign-in/up pill toggle, Google, forgot password
- Signup wizard (type → credentials); cookie intent; themed PlanSelectStep; yearly amount
- Forgot/reset password; optional set-password for Google; awaiting signOut + clear wait copy

## Ops notes

- Add `/auth/reset-password` to Supabase Auth redirect allow list
- Bank details still owned at `/admin/settings/billing`
