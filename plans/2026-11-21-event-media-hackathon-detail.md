# Event media specs + hackathon detail UI

**Status:** done  
**Date:** 2026-11-21

## Goal

Align event media uploads to the landscape size/format matrix, and upgrade the public event details page (especially hackathons) toward the Stitch multi-competition mock using existing `getPublicEventView` data.

## Shipped

### Media

- `uploadKinds`: banner 2MB ingress / 800KB WebP; gallery & competition 800KB; logos 150KB + SVG; avatars 300KB
- Soft dimension/aspect warnings; SVG pass-through for logo kinds
- `ASSET_SPEC` + `AssetSpecGuide` on wizard/edit; `MediaUpload` per-kind hard max + hints

### Public UI

- Hero Register / Explore tracks CTAs + closing-soon chip
- `PublicMediaGuidelineStrip` under hero
- Masonry-style gallery + gallery spec line
- Hackathon `PublicTrackSwitcher` (tabs over competitions); sticky “Register your squad”
- Speakers heading → jury/mentors when hackathon

## Out of scope (unchanged)

- Public judges/mentors/rubric/milestone APIs
- First-class campus vs hybrid registration mode
