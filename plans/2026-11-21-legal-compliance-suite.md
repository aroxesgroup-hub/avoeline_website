# Legal Compliance Suite (editable)

**Status:** done  
**Date:** 2026-11-21

## Goal

Ship a Stitch-styled Compliance & Governance Suite matching the legal hub mock: sticky sidebar, stacked document cards, Zero-Sell panel, DPA CTA, printable bundle — with CMS-editable bodies and suite chrome.

## Approach

- Canonical hub: `/legal`
- Deep links `/privacy`, `/terms`, `/organizer-agreement`, `/content-rights` render the same suite and scroll to the matching card (consent/wizard slugs unchanged)
- Bodies: immutable `legal_documents` / `legal_document_versions` via `/admin/website?tab=legal`
- Suite chrome: `site_settings.legal_suite` (zod + admin form)
- Callouts in markdown: `> [!NOTE|WARNING|GUARANTEE|SPLIT]`

## Shipped

- `LegalSuiteView`, `LegalDocumentCard`, `LegalMarkdownBody`, `LegalSuitePage`
- `legalSuite.logic.ts`, `parseLegalSegments` in `legalMarkdown.ts`
- Admin: `LegalSuiteChromePanel` + callout help on Legal tab
- Migration `20261121180000_legal_compliance_suite.sql` (settings RLS + defaults + v2 bodies)
- Footer LEGAL links + sitemap `/legal`

## Out of scope

- Real PDF generation (print CSS / `window.print` only)
- Moving legal copy into `site_pages` / `site_blocks`
