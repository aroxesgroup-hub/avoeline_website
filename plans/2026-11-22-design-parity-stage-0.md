# Design parity — Stage 0 inventory (STOP)

**Status:** Stage 0 done — inventory shipped in [`docs/design-parity.md`](../docs/design-parity.md). Awaiting approval before Stage 1.

Follow [`docs/ENGINEERING_RULES.md`](../docs/ENGINEERING_RULES.md). Designs live under [`design/`](../design/) (Windows also shows `Design/` — same folder). Visual source of truth for organizer shell + event tabs; schema/actions win over design. Later stages (tokens → shared UI → tabs → scoreboard → import → QA) wait until Stage 0 is approved.

## Deliverable (completed)

Created [`docs/design-parity.md`](../docs/design-parity.md) with:

1. **Inventory table** — one row per unique design screen  
2. **Skipped design elements** — no route / no data / would need schema or logic change  
3. **App surfaces with no design** — keep current layout in Stage 5 (tokens/components only)  
4. **Resume notes** — next stage after approval = Stage 1 token extraction into `src/styles/theme.css`

Defaults locked for Stage 0:

- Deduplicate by basename; treat `Event Speakers & Directory — Avoeline-1` as an alternate/empty state of Speakers (same route).
- Canonical event routes are under `/organizer/[organizer_id]/events/[eventId]/…` (not legacy `/hackathon/[eventId]/…` redirects).
- Modals (“Add …”) map to the parent tab’s create/edit flow, not new routes.

## Later stages (blocked until each STOP)

- **1** Token extraction → `src/styles/theme.css` + WCAG table → STOP  
- **2** Shared components + `/dev/design-system` + `docs/design-system.md` → STOP  
- **3** Organizer shell + left tabs (STOP every 3)  
- **4** Event tabs (STOP every 4)  
- **5** Public/auth/marketing/admin token pass  
- **6** Lint/CI hard-color purge  
- **7** Live scoreboard root-cause + fix + tests  
- **8** Full attendee import (template → map → validate → import → undo → emails)  
- **9** Side-by-side parity QA + docs 11 / completeContext  

Status values in the parity doc: `not_started` | `in_progress` | `done` | `skipped`.
