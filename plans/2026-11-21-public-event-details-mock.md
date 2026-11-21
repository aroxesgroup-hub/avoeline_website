# Public event details — mock alignment

**Status:** done  
**Date:** 2026-11-21

## Goal

Match the Stitch white+emerald event-details mock: breadcrumbs, quick-info bar, sticky Reserve seat with real tier selection, full agenda/speakers/competitions/gallery, and contain-based media (no edge crop). Keep public DTO allowlist (plain `paymentInstructions` only).

## Done

- Hero: contain banner, breadcrumbs, curated badge, Share/Calendar
- Quick bar: date, schedule, venue, admission, capacity %
- Sticky Reserve seat + `ticketTierId` cards + promo preview + mint payment panel
- Sections reordered; gallery/competition images `object-contain`
- Loading skeleton + docs

## Notes

- No structured public IBAN/Raast fields
- Featured tracks only when hackathon competitions exist
- Certificate marketing band omitted (no DTO signal)
