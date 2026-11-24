# Stage 5 Batch 1 — Marketing + public tokens

**Status:** done  
**Date:** 2026-11-23  
**Parent:** Stage 5 public/auth/marketing/admin token pass (Batches 1–3)

## Scope shipped

Tokens / shared components only — no layout or IA changes. Marketing `--mkt-*` stays shell-scoped.

| Change | Files |
| --- | --- |
| 404 canvas aligned with marketing shell | `src/app/not-found.tsx` — `bg-canvas` → `bg-[var(--mkt-canvas)]` |
| Form errors → danger token | `src/features/website/components/ContactForm.tsx`, `PartnerApplicationForm.tsx` |
| Spot-check | `(marketing)`, `events`, `verify`, `shared_components/chrome` — no additional hard-color hits |

**Deferred to Batch 3:** `AdminBlockEditor.tsx` `text-red-600` (admin CMS).

## Non-goals (unchanged)

- No block-renderer / pricing redesign
- No attendee/vendor or organizer no-PNG sweeps
- No AdminRail / auth work (Batches 2–3)

## STOP

**Batch 1 STOP.** Next after approval: Stage 5 Batch 2 (auth tokens) → **STOP**.
