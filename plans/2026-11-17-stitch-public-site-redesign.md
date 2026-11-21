# Stitch public site redesign

**Status:** done  
**Stitch project:** Modern Dual-Theme Website Redesign (`projects/13819902314645578273`)

## What shipped

Visual redesign of all relevant public surfaces to the Stitch dual-theme (teal/mint + Bricolage Grotesque), keeping live CMS / plans / events / auth data.

### Built screens → routes

| Stitch screen | Route |
| --- | --- |
| Homepage + Mobile Home | `/` |
| Plans & Pricing | `/plans` |
| About | `/about` |
| Partners & Vendors | `/partners` |
| Contact | `/contact` |
| Legal & Compliance Hub | `/privacy`, `/terms` |
| Events Directory (+ mobile) | `/events` |
| Event Detail | `/events/[eventId]` shell |
| Sign In & Sign Up | `/auth/signin`, `/auth/signup` |

### Deferred

- Organizer Command Center (dashboard)
- Audit extract / prompts `.md` screens

## Key files

- Tokens: `src/app/globals.css` (`.marketing-shell` / `.public-shell`), `src/app/layout.tsx` (Bricolage)
- Chrome: `SiteHeader.tsx`, `AppFooter.tsx`
- Blocks: `src/features/website/blocks/renderers/*`
- Marketing pages + `PlansComparison`, `LegalDocumentView`
- Events: `src/app/events/layout.tsx`, `page.tsx`, `PublicEventHero.tsx`
- Auth: `AuthShell.tsx`

## Gaps / follow-ups

- Navigation/footer CMS tab still does not drive header/footer links.
- CMS publish smoke and full viewport matrix should be confirmed against a running local/staging server with seeded CMS content.
- Compete nested under `/events` inherits public chrome; acceptable for this pass.
