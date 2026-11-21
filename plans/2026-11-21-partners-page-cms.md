# Partners page CMS + logos + application email

**Status:** done  
**Date:** 2026-11-21

## Goal

Match the partnership mock on white/emerald light+dark tokens, editable from Website CMS, with partner logos, empty sections/CTAs hidden, and applications emailed to info@aroxes.com.

## Done

- `/partners` = `MarketingPageBlocks` + `PartnerApplicationForm` (`#partner-apply`)
- `logo_wall.category` filters granted `site_partners`; empty → hide
- Audience tabs support image + CTA; CTAs omit when href empty
- Partners admin: logo picker via `site_media` / `logo_media_id`
- `submitPartnerApplicationAction` → `contact_messages` + `info@aroxes.com`
- Seed migration for partners CMS content

## Follow-up (2026-11-21)

- Seeded 6 demo partners + CMS refresh for stats/gateways/perks/trust panel (`20261121150000_partners_demo_content.sql`).

## Edit later

- Pages tab: copy/sections for partners (including `steps.panel` JSON)
- Partners tab: approve + attach logos
- Contact inbox: filter topic `partnership`
