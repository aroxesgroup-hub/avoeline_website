# Events directory + Plans annual + nav fix

**Status:** done  
**Date:** 2026-11-21

## Goal

Unify `/events` chrome with the full marketing nav, polish Plans annual billing display against live yearly prices, and rebuild the public events directory to match the discovery mock with working GET filters, proper landscape images, spotlight, and bottom CTAs.

## Done

- Events layout → `marketing-shell` + marketing `SiteHeader` (6 links); retired short `PUBLIC_LINKS`.
- Plans annual: yearly total + ≈ monthly subline; CTA `billing=year|month` (display only).
- `getEventsDirectory`: `isListedPublicly` (tiered listed), no demo/archived; filters `q`/`city`/`category`/`when`/`price`; facets + spotlight.
- `/events` UI: hero, toolbar, spotlight, 16:10 cards, verify + organizer CTAs; `/verify` accepts `?code=`.

## Files

- `src/app/events/{layout,page}.tsx`
- `src/shared_components/chrome/SiteHeader.tsx`
- `src/features/events/browse.service.ts`, `browseFilters.ts`, `components/browse/*`
- `src/features/website/{marketingData.logic.ts,components/PlansPricingCards.tsx}`
- `src/app/verify/{page,layout}.tsx`
