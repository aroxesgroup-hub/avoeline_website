# Homepage mockup → CMS + live data

**Status:** done

## What shipped

- Homepage UI aligned to the latest dual-theme mock (hero dashboard, proof chips, how-it-works, bento tools, audience, events, plans, FAQ, CTA).
- All section copy lives in `site_blocks` (edit `/admin/website` → Pages → Home).
- **Events:** live public/hybrid rows (`listMarketingEvents`); cards show date/location + Register.
- **Plans:** live `subscription_plans` (`listPublicPlans`); features from `highlight_features` (Plans display tab).
- **Stats:** CMS values win when set (e.g. `8+` Countries); empty CMS values fill from live `get_public_stats` keys.
- Hero Live Event Dashboard remains CMS demo content (not organizer live metrics).

## Key files

- `src/features/website/blocks/schemas.ts` + renderers
- `src/features/website/components/MarketingPageBlocks.tsx`
- `supabase/migrations/20261121120000_homepage_mock_cms_content.sql`
