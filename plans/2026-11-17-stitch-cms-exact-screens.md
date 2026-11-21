# Stitch screens → CMS-editable public site

**Status:** done  
**Stitch project:** Modern Dual-Theme Website Redesign (`projects/13819902314645578273`)

## What shipped

- Extended `hero` block schema with `eyebrow`, `statusLine`, `tertiaryCta`, `trustTitle` / `trustLogos`, and `command` (Live Event Command mock).
- `HeroCommandPanel` + Stitch hero layout (CTAs: Get started / Browse events / See plans).
- Migration `20261117120000_stitch_marketing_content.sql` upserts home/about/partners/contact draft+published from Stitch copy.
- Home section renderers + Plans page headline aligned to Stitch tone.
- Live hydration unchanged: stats, plans, events, consented partners.
- Organizer Command Center dashboard screen remains out of scope.

## Edit path

`/admin/website?tab=pages` → Home → Hero → JSON fields `command`, `trustLogos`, `tertiaryCta`.

## Key files

- `src/features/website/blocks/schemas.ts`
- `src/features/website/blocks/renderers/Hero.tsx`
- `src/features/website/blocks/renderers/HeroCommandPanel.tsx`
- `supabase/migrations/20261117120000_stitch_marketing_content.sql`
