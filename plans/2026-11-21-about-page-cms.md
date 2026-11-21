# About page exact mock + CMS

**Status:** done  
**Date:** 2026-11-21

## Goal

Make `/about` match the Avoeline About mock section-for-section under white/mint/emerald tokens, with every section owned by Website CMS blocks (including new `comparison` + `lineage` types).

## Done

- New blocks: `comparison` (Legacy vs Fabric columns), `lineage` (Aroxes dark band)
- Polished `feature_grid` (`eyebrow`, `anchorId`), `cta` (`variant: email|buttons`), `team` (`mkt-card`)
- Seed: hero → stats_strip → comparison → feature_grid → lineage → team → cta(buttons)
- `/about` thin + `revalidate=60`; `AboutFallback` only when unpublished
- Home feature_grid `anchorId=product` so Features nav keeps working

## Edit later

- Pages tab → About: copy, stats demo numbers, comparison sides, lineage products, advisors, CTA links
