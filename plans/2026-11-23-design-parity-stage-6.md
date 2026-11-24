# Stage 6 — Lint/CI hard-color purge

**Status:** done  
**Date:** 2026-11-23

## Shipped

1. **Gate:** [`scripts/check-hard-colors.mjs`](../scripts/check-hard-colors.mjs) — bans chromatic Tailwind utilities, `from-gray-900` / `to-gray-950` / `accent-gray-900`, and `hover:brightness-*` in `src/**/*.{ts,tsx}`.
2. **npm:** `check:hard-colors`; prepended to `test:unit` (hard CI via existing unit step).
3. **Allowlist:** `BrandMark.tsx` (`brightness-0 invert` logo treatment).
4. **Purge:** remapped errors → `danger*`, caution → `warning*`, categorical/CTF → `series-*` / primary/accent tokens across ~60 TSX files (CTF cluster, DomainCategoryPicker, teams, connections, forms, vendor accent).

## Non-goals (unchanged)

- Soft ESLint / lint-staged debt
- Stage 7 scoreboard logic
- Stage 8 attendee import

## STOP

**Stage 6 STOP.** Next after approval: Stage 7 (live scoreboard root-cause + fix + tests) → **STOP**.
