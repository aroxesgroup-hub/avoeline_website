# Plans page mock (pricing UI + live catalog)

**Status:** done  
**Date:** 2026-11-21

## Goal

Match the Stitch/mock Pricing & Plans layout (hero, monthly/annual toggle, three cards, comparison table, FAQ accordion, campus CTA) while keeping prices, modules, and FAQs from the database, under the white/mint/emerald light+dark marketing tokens.

## Done

- Split client pricing cards (`PlansPricingCards`) from server `PlansPageContent` so `marketingData.service` stays server-only.
- Price helpers live in `marketingData.logic.ts` (re-exported from service).
- Seeded Free/Pro/Enterprise display copy + `highlight_features`; made Enterprise public for the third card; seeded `site_faqs` scope=`plans`.
- Comparison table, FAQ accordion, and deep-green campus CTA use `--mkt-*` tokens (light + dark).

## Files

- `src/features/website/components/PlansComparison.tsx`
- `src/features/website/components/PlansPricingCards.tsx`
- `src/features/website/marketingData.logic.ts`
- `src/app/(marketing)/plans/page.tsx`
- `supabase/migrations/20261121130000_plans_page_display_content.sql`

## Edit later

- Plan cards / highlights / public flags: `/admin/plans` + Website Plans display tab
- FAQs: `/admin/website?tab=faq` (scope plans)
- Optional CMS blocks still render below via `MarketingPageBlocks` slug=`plans`
