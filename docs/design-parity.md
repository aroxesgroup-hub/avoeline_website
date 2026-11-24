# Design parity inventory

**Status:** Design-parity program complete (Stages 0–9).  
**Visual source:** [`design/`](../design/) (Windows may show `Design/` — same folder). Canonical path is lowercase `design/`.  
**Product tokens:** [`src/styles/theme.css`](../src/styles/theme.css) (imported from [`src/app/globals.css`](../src/app/globals.css)).  
**Design system:** [`docs/design-system.md`](design-system.md) · gallery `/dev/design-system` (non-prod + platform admin).  
**Rules:** [`ENGINEERING_RULES.md`](ENGINEERING_RULES.md). Schema and existing actions win over design. Plan gating stays. Do not invent screens, permissions, or schema.

**Status values (later stages):** `not_started` | `in_progress` | `done` | `skipped`

**Locked defaults (Stage 0):**

- Deduplicate design PNGs by basename.
- `Event Speakers & Directory — Avoeline-1.png` is an alternate / empty state of Speakers (same route as the primary Speakers design).
- Canonical event routes are under `/organizer/[organizer_id]/events/[eventId]/…` (not legacy `/hackathon/[eventId]/…` redirects).
- Modals (“Add …”) map to the parent tab’s create/edit flow, not new routes.

---

## Inventory

Columns: Design file | Route | Component(s) | Status | Deviations / notes

### Organizer left rail

| Design file | Route | Component(s) | Status | Deviations / notes |
| --- | --- | --- | --- | --- |
| `Organizer Dashboard — Avoeline.png` | `/organizer/[id]/dashboard` | `dashboard/page.tsx`, `UpcomingEvents`, `TodaysSchedule`, `RecentRegistrations`, `RegistrationTrendChart`, `MetricTile`, `ConnectionsChecklistCard` | `done` | Stage 3 Batch 4: PageHeader + density. Widgets/charts content unchanged. |
| `My Events — Avoeline.png` | `/organizer/[id]/events` | `events/page.tsx` + list/filter UI | `done` | Stage 3 Batch 4: eyebrow + toolbar Card + list/grid density. |
| `Event Analytics — Avoeline.png` | `/organizer/[id]/analytics` | `analytics/page.tsx` + analytics charts/tiles | `done` | Stage 3 Batch 2: chrome + series tokens. Module-gated (`analyticsOk`). |
| `Vendor Quotes & Marketplace RFQs — Avoeline.png` | `/organizer/[id]/vendor-marketplace` (+ `/quotes`) | marketplace page + `quotes/page.tsx` | `done` | Stage 3 Batch 2: split routes kept; cross-links + chrome. |
| `Custom Forms & Feedback Engine — Avoeline.png` | `/organizer/[id]/forms` | forms list page | `done` | Stage 3 Batch 3: list chrome. |
| `Form Builder & Survey Editor — Avoeline.png` | `/organizer/[id]/forms/[formId]` | form builder page (+ responses under `[formId]/responses`) | `done` | Stage 3 Batch 4: chrome + Card + FilterTabs. Responses: light chrome only. |
| `Connections & Integrations — Avoeline.png` | `/organizer/[id]/settings/connections` | Connections settings (N7 single page) | `done` | Stage 3 Batch 3: hub tokens + chrome. |
| `Teams & Access Management — Avoeline.png` | `/organizer/[id]/teams?tab=` | `OrganizerTeamsShell` (Teams / Recruitment / Access) | `done` | Stage 3 Batch 3: FilterTabs + shell chrome. |
| `Recruitment & Volunteer Pipelines — Avoeline.png` | `/organizer/[id]/teams?tab=recruitment` | `OrganizerTeamsShell` recruitment tab | `done` | Shell chrome; FormBuilder body deferred. |
| `Access & RBAC Permissions — Avoeline.png` | `/organizer/[id]/teams?tab=access` | `OrganizerTeamsShell` Access grants tab | `done` | Same route shell chrome. |
| `Organizer Profile & Account Settings — Avoeline.png` | `/organizer/[id]/profile` | profile page | `done` | Stage 3 Batch 4: breadcrumbs/eyebrow/Card panels + CTA buttons. |
| `Add Team Member — Avoeline.png` | teams Add-member modal (no new route) | stepped modal on Teams | `done` | Stage 3 Batch 3: modal danger tokens. |

### Event tabs

Shell: [`src/app/organizer/[organizer_id]/events/[eventId]/layout.tsx`](../src/app/organizer/[organizer_id]/events/[eventId]/layout.tsx])  
Prefix below: `/organizer/[id]/events/[eventId]`

| Design file | Route / tab | Component(s) | Status | Deviations / notes |
| --- | --- | --- | --- | --- |
| `Event Dashboard — UCP Takkra 2026.png` | `…/events/[eventId]` Overview | overview page, `overviewFacts`, `MetricTile`, checklist, share | `done` | Stage 4 Batch 1: panel Card hero + density. Tab label “Overview”. |
| `Event Attendees & Check-in Roster — Avoeline.png` | `…/attendees` | `AttendeeClientSide` + `AttendeeImportPanel` | `done` | Stage 4 roster chrome + Stage 8 full import (template/undo/email). |
| `Teams & Squads Roster — Avoeline.png` | `…/attendees` (hackathon team grouping) | `TeamGroupView` / `GroupedAttendeeList` / roster grouping | `done` | Stage 4 Batch 1: same route; grouped/flat toggle chrome. |
| `Event Team & Roster Assignment — Avoeline.png` | `…/staff` (nav label Team) | `TeamsManager` | `done` | Stage 4 Batch 1: eyebrow + list chrome. Nav value `staff`, label “Team”. |
| `Event Access & Ticketing SKUs — Avoeline.png` | `…/access` | Access settings + tiers/promos editors | `done` | Stage 4 Batch 1: section header + danger tokens in selectors. |
| `Event Agenda & Run of Show — Avoeline.png` | `…/agenda` | agenda board (+ `AgendaItemModal`) | `done` | Stage 4 Batch 2: eyebrow + Card toolbar/day strip; add stays modal. |
| `Event Speakers & Directory — Avoeline.png` | `…/speakers` | speakers list / forms (+ `create-speaker`) | `done` | Stage 4 Batch 2: eyebrow + search Card + tile chrome. |
| `Event Speakers & Directory — Avoeline-1.png` | `…/speakers` | same as Speakers (empty / alternate state) | `done` | Stage 4 Batch 2: empty state Card on same route. |
| `Event Vendors Directory — Avoeline.png` | `…/vendors` | event vendors UI | `done` | Stage 4 Batch 2: eyebrow + Card rows. Plan-gated. |
| `Add Event Vendor — Avoeline.png` | vendors add flow (no new route) | vendor modal/form on Vendors tab | `done` | Stage 4 Batch 2: existing `AddOwnVendorModal` tokens. |
| `Event Sponsors & Partners Directory — Avoeline.png` | `…/sponsors` | `SponsorsBoard` | `done` | Stage 4 Batch 2: eyebrow + list `rounded-xl`. |
| `Add Sponsor Organization — Avoeline.png` | sponsors add (no new route) | `OrganizationForm` / sponsor add flow | `done` | Stage 4 Batch 2: modal IA unchanged; board chrome. |
| `Event Expenses & Financial Ledger — Avoeline.png` | `…/expenses` | `ExpensesClient` | `done` | Stage 4 Batch 3: eyebrow + Card metrics/filters; danger budget alert. |
| `Add Expense Entry — Avoeline.png` | expenses add (no new route) | expense modal on Expenses | `done` | Stage 4 Batch 3: modal IA unchanged. |
| `Event Competitions & Tracks — Avoeline.png` | `…/competitions` | competitions list / `CompetitionModal` | `done` | Stage 4 Batch 3: eyebrow + workspace density. |
| `Add Competition Track — Avoeline.png` | `…/competitions/[trackId]` or create | `TrackForm` / competition create-edit | `done` | Stage 4 Batch 3: create modal; track page chrome. |
| `Event Phases & Tasks — Avoeline.png` | `…/tasks` | phases/tasks workspace | `done` | Stage 4 Batch 3: eyebrow + toolbar Card. |
| `Add Event Phase — Avoeline.png` | tasks add phase (no new route) | phase modal on tasks | `done` | Stage 4 Batch 3: modal IA unchanged. |
| `Event Submissions & Evaluation Dossier — Avoeline.png` | `…/submissions` | submissions table / hackathon workspace views | `done` | Stage 4 Batch 3: eyebrow + filter Card. |
| `Event Live Scoreboard — Avoeline.png` | `…/scoreboard` | `HackathonWorkspace` (`view="scoreboard"`), `LiveScoreboardTable`, `live_scoreboard` setting, `scoreboardAggregate` | `done` | Stage 4 chrome + Stage 7 review→completions sync + tests. |
| `Event & Competition Settings — Avoeline.png` | `…/settings` | hackathon / competition settings | `done` | Stage 4 Batch 4: eyebrow + workspace settings Cards. |
| `Event Certificates & Credential Issuance — Avoeline.png` | `…/certificates` | certificates UI (+ `making-template`) | `done` | Stage 4 Batch 4: list chrome + `text-danger`; template shell only. |
| `Event Files & Google Drive Library — Avoeline.png` | `…/files` | FileStore library | `done` | Stage 4 Batch 4: eyebrow + `max-w-5xl` + paper panels. |
| `Event Exports & Google Sheets Sync — Avoeline.png` | `…/exports` | exports / sheet sync + `AttendeeImportPanel` | `done` | Stage 4 chrome + Stage 8 import on Exports. |

**Unique design basenames inventoried:** 35 (+ Speakers `-1` as paired alternate of Speakers = 36 PNG files on disk).

**Stage 9 QA (2026-11-23):** All inventoried PNG basenames present under `design/`; route/component notes match Stages 3–8 STOPs. Automated: `check:hard-colors` ok; scoreboard + attendee import unit tests 22/22 pass. No layout invent; intentional gaps stay in Skipped / no-PNG / residual debt.

---

## Skipped design elements

Document controls or chrome that appear in PNGs but must not be built as new product surface without an approved schema/logic change. Update this list during later stages when a specific control is confirmed absent.

| Element / implication | Reason to skip |
| --- | --- |
| Dedicated public mentors / rubric-only chrome if shown as its own organizer tab | Phase B removals; no current event tab for standalone mentor/rubric product chrome. |
| Any control requiring new permissions, tables, or enums beyond existing Postgres | Schema/actions win; list here and do not invent. Confirm per screen in Stages 3–4. |
| New top-level routes implied only by design labels | Canonical routes above are authoritative; modals stay on parent tabs. |
| Legacy `/organizer/.../hackathon/[eventId]/…` as design targets | Redirect/compat only; parity work targets `…/events/[eventId]/…`. |
| Design-only widgets with no backing query/action | Keep current data-backed UI; restyle only where tokens/components apply. |

---

## App surfaces with no design PNG

Stage 5 applies **tokens / shared components only** — keep current layout and information architecture.

| Surface | Route(s) | Notes |
| --- | --- | --- |
| Notifications | `/organizer/[id]/notifications` | No design PNG. |
| Chatbot | `/organizer/[id]/chatbot` | No design PNG. |
| Designer | `/organizer/[id]/designer` | Plan-gated; no design PNG. |
| Ushers | `/organizer/[id]/ushers` | Plan-gated; no design PNG. |
| Email batches | `/organizer/[id]/settings/email-batches`, `/organizer/[id]/email` | No design PNG. |
| Create-event wizard | `/organizer/[id]/events/create` (+ steps) | No step PNGs in `design/`. |
| Library | `/organizer/[id]/library` | No design PNG. |
| Booking details / counter-offer / view-vendor | booking + vendor detail routes | Marketplace adjacency; no dedicated PNGs. |
| Form responses | `/organizer/[id]/forms/[formId]/responses` | Builder has design; responses does not. |
| Certificate template editor | `…/certificates/making-template` | Certificates list has design; editor does not. |
| Public / auth / marketing / admin shells | marketing, auth, `/admin/*` | Stage 5 token pass only (no organizer design set). |
| Attendee / vendor portals | `/attendee/*`, `/vendor/*` | Out of organizer design set; Stage 5 tokens only if in scope. |

---

## Leveraged code (Stages 7–8 — shipped)

- **Scoreboard (Stage 7):** `HackathonWorkspace.tsx`, `LiveScoreboardTable.tsx`, `live_scoreboard` setting, `scoreboardAggregate.ts`, review→completions sync.
- **Attendee import (Stage 8):** `src/features/event_attendee/import/` — template, map, validate, commit + `importBatchId` undo, optional emails.

---

## Stage 1 — tokens + WCAG

**Shipped:** Product `:root` / dark tokens moved to [`src/styles/theme.css`](../src/styles/theme.css); brand remapped violet → emerald/forest; `@theme` aliases unchanged in `globals.css`. Marketing `--mkt-*` unchanged (value bridge documented below). `--rail-*` reserved for Stage 3 shell. No component restyles in Stage 1.

### Marketing bridge (`--mkt-*` ↔ product)

| Marketing | Product | Notes |
| --- | --- | --- |
| `--mkt-accent-deep` / `--mkt-btn` `#064e3b` | `--primary` (light) | Same CTA green |
| `--mkt-accent-tint` `#ecfdf5` | `--primary-soft` / `--accent-soft` | Soft mint wash |
| `--mkt-line` `#d1e7df` | `--accent-line` | Sage hairline |
| `--mkt-accent` `#059669` | — | **Not** used as product `--accent` (fails AA as small text on paper at ~3.77:1). Product `--accent` is `#047857`. |
| Dark `--mkt-canvas` `#071412` / `--mkt-panel` `#17332d` | `--canvas` / `--paper` dark | Forest dark surfaces |

### WCAG contrast table (AA)

Ratios measured with relative luminance (sRGB). **AA body** ≥4.5:1; **AA large / UI** ≥3:1.

#### Light mode

| Foreground | Background | Ratio | AA body | Notes |
| --- | --- | --- | --- | --- |
| `--ink` `#0F1716` | `--paper` `#ffffff` | 18.19:1 | Pass | |
| `--ink` `#0F1716` | `--canvas` `#F9FAF7` | 17.36:1 | Pass | |
| `--ink-soft` `#5B6B64` | `--paper` | 5.63:1 | Pass | |
| `--ink-soft` `#5B6B64` | `--canvas` | 5.37:1 | Pass | |
| `--ink-faint` `#64746B` | `--paper` | 4.94:1 | Pass | |
| `--ink-faint` `#64746B` | `--canvas` | 4.71:1 | Pass | |
| `--primary` `#064E3B` | `--paper` | 9.72:1 | Pass | |
| `--primary` `#064E3B` | `--canvas` | 9.28:1 | Pass | |
| `--primary-foreground` `#ffffff` | `--primary` `#064E3B` | 9.72:1 | Pass | Filled CTA |
| `--accent` `#047857` | `--paper` | 5.48:1 | Pass | Links / emphasis |
| `--accent-strong` `#065F46` | `--paper` | 7.68:1 | Pass | |
| `--success` `#15803d` | `--paper` | 5.02:1 | Pass | |
| `--success` `#15803d` | `--success-soft` `#ecfdf5` | 4.76:1 | Pass | |
| `--warning` `#b45309` | `--paper` | 5.02:1 | Pass | |
| `--warning` `#b45309` | `--warning-soft` `#fffbeb` | 4.84:1 | Pass | |
| `--danger` `#b91c1c` | `--paper` | 6.47:1 | Pass | |
| `--danger` `#b91c1c` | `--danger-soft` `#fef2f2` | 5.91:1 | Pass | |
| `--accent-on-ink` `#6EE7B7` | `--rail-bg` `#0B1C1A` | 11.53:1 | Pass | On-rail only |
| `--series-1` `#0F766E` | `--paper` | 5.47:1 | Pass | |
| `--series-2` `#0891b2` | `--paper` | 3.68:1 | Fail body | Marks / large UI only |
| `#059669` (mkt accent) | `--paper` | 3.77:1 | Fail body | Do not use as product link text |

#### Dark mode

| Foreground | Background | Ratio | AA body | Notes |
| --- | --- | --- | --- | --- |
| `--ink` `#ecfdf8` | `--paper` `#17332d` | 12.90:1 | Pass | |
| `--ink` `#ecfdf8` | `--canvas` `#071412` | 17.87:1 | Pass | |
| `--ink-soft` `#8fb5ab` | `--paper` | 6.05:1 | Pass | |
| `--primary` `#34d399` | `--paper` | 7.06:1 | Pass | Links on dark |
| `--primary-foreground` `#022c22` | `--primary` `#34d399` | 7.88:1 | Pass | Text on mint fill |
| `--accent` `#6ee7b7` | `--paper` | 8.90:1 | Pass | |
| `#ffffff` | `#059669` (mkt btn) | 3.77:1 | Fail body | Marketing CTA; large/UI only |

**Fail / restricted notes**

- `--accent-on-ink` / mint indicators: for dark rail/panel only — not body text on paper.
- `--series-2` cyan: chart marks / large UI (≥3:1), not small body text.
- Marketing `#059669` as fill with white label: large text / UI chrome only unless paired with darker fill (`#064e3b`).

---

## Stage 2 — shared UI

**Shipped:** `buttonClass` / `Button` primary → brand emerald; destructive outlined (no brightness); Badge/Modal/Card/Input/Select aligned; ConfirmDialog token backdrop; [`docs/design-system.md`](design-system.md); gated `/dev/design-system` gallery. No DashboardNav / organizer shell restyles.

## Stage 3 Batch 1 — shell

**Shipped:** `DashboardNav` forest rail via `--rail-*` / `bg-rail`; organizer `bg-canvas` + nav label “My Events”; Dashboard/Events layout-only chrome. Vendor/department inherit shared rail. **AdminRail** forest `--rail-*` shipped in Stage 5 Batch 3.

## Stage 3 Batch 2 — Analytics / Marketplace / Quotes

**Shipped:** `PageHeader` eyebrow; Analytics filter Card + KPI cards + series chart colors; Marketplace/Quotes breadcrumbs + cross-links; Quotes `FilterTabs` + `max-w-7xl`. No merged RFQ route; no design-only KPIs/tabs.

## Stage 3 Batch 3 — Forms / Connections / Teams

**Shipped:** Forms list chrome; Connections hub status tokens + `buttonClass`; Teams `FilterTabs` + filter Card + modal danger tokens.

## Stage 3 Batch 4 — Form builder / Profile / list density

**Shipped:** Form editor + responses breadcrumbs/eyebrow/`max-w-5xl`/Card/`FilterTabs`/danger tokens; Profile breadcrumbs/eyebrow/Card panels + Connections `buttonClass`; Dashboard `PageHeader` + tighter gaps; My Events eyebrow + toolbar Card + denser list/grid. Shared `FormBuilder` delete → `text-danger` only. Stage 3 left-rail closed.

**Batch 4 STOP.** Stage 3 closed; Stage 4 started.

## Stage 4 Batch 1 — Event shell · Overview · Attendees · Team · Access

**Shipped:** Event layout `Breadcrumbs` + eyebrow + Stage 3 padding; `EventsTab` accent underline + expenses/files icons; Overview `Card tone="panel"` hero + denser Cards; Attendees roster chrome (grouped/flat, metrics Card, check-in tokens); Team tab eyebrow + `TeamsManager` density; Access section header + `AccessTypeSelector` danger/`rounded-xl`. Shell is shared for later batches.

**Batch 1 STOP.**

## Stage 4 Batch 2 — Agenda · Speakers · Vendors · Sponsors

**Shipped:** Agenda eyebrow + Card toolbar/day strip + timeline `rounded-xl`; Speakers eyebrow/search Card/empty Card + create overlay `rounded-xl`; Vendors eyebrow + Card rows; Sponsors eyebrow + board list/preview `rounded-xl`. Add flows stay existing modals/routes.

**Batch 2 STOP.**

## Stage 4 Batch 3 — Expenses · Competitions · Phases & Tasks · Submissions

**Shipped:** Expenses eyebrow + Card metrics/filters + danger budget alert; Competitions/Tasks/Submissions page eyebrows + `HackathonWorkspace` density; track manage page chrome; Phases toolbar Card; Submissions filter Card. Add modals IA unchanged.

**Batch 3 STOP.**

## Stage 4 Batch 4 — Scoreboard · Settings · Certificates · Files · Exports

**Shipped:** Scoreboard/Settings eyebrows around workspace; Certificates list + MetricTile Card + `text-danger` + making-template shell; Files `max-w-5xl` + paper panels; Exports eyebrow + Sheets `rounded-xl` + import chrome only. Stage 4 event tabs closed.

**Batch 4 STOP.** Stage 4 done. Next after approval: Stage 5 (public/auth/marketing/admin token pass) → **STOP**.

## Stage 5 Batch 1 — Marketing + public

**Shipped:** `not-found` uses `--mkt-canvas` under `marketing-shell`; Contact + Partner forms `text-danger`; marketing/events/verify/chrome spot-check clean (AdminBlockEditor deferred to Batch 3). Layout/IA unchanged.

**Batch 1 STOP.** Next after approval: Stage 5 Batch 2 (auth tokens) → **STOP**.

## Stage 5 Batch 2 — Auth tokens

**Shipped:** GoogleAuthButton `text-danger`; ProfileLoadingState spinner `border-t-ink` / `border-b-line`; Organizer/Vendor profile avatar `outline-primary`. AuthShell hero `text-white/*` left unchanged. Layout/IA unchanged.

**Batch 2 STOP.** Next: Stage 5 Batch 3 (AdminRail + admin hard colors) → Stage 5 done → **STOP**.

## Stage 5 Batch 3 — Admin rail + admin errors

**Shipped:** `AdminRail` forest `--rail-*` (mirrors `DashboardNav`); AdminBlockEditor + AdminConnectionStatus `text-danger`. Mobile drawer product tokens unchanged. Nav IA unchanged. Stage 5 closed.

**Batch 3 STOP.** Stage 5 done. Next after approval: Stage 6 (lint/CI hard-color purge) → **STOP**.

## Stage 6 — Lint/CI hard-color purge

**Shipped:** `scripts/check-hard-colors.mjs` + `npm run check:hard-colors`; wired into `test:unit` (hard CI via existing unit step). Remapped chromatic Tailwind utilities in `src/**/*.{ts,tsx}` to theme tokens (`text-danger`, `bg-danger-soft`, `text-warning`, `series-*`, `primary`/`accent`). BrandMark `brightness-0 invert` allowlisted. ESLint remains soft.

**Gate:** `npm run check:hard-colors` (also runs at start of `npm run test:unit`).

**Stage 6 STOP.** Next after approval: Stage 7 (live scoreboard root-cause + fix + tests) → **STOP**.

## Stage 7 — Live scoreboard root-cause + fix + tests

**Shipped:** Organizer `reviewTaskSubmission` upserts `hackathon_task_completions` (accept/reject/points); `submitTaskWork` no longer awards full points pending review; null `attempted_at` excluded from hour-ago cutoffs (`includeUnstamped`); unit tests for review sync, movement, tie-break. Board source of truth remains completions-only (15s `LiveRefresh`).

**Stage 7 STOP.** Next after approval: Stage 8 (full attendee import) → **STOP**.

## Stage 8 — Full attendee import

**Shipped:** XLSX template download; stepped Upload → Map → Preview → Commit → Done; `extra.importBatchId` + undo cancel; optional `registration_confirmed` emails; 500-row cap / 50-row chunks; free-only gate unchanged. Tests: `attendeeImport.logic.test.ts` + `n5Attendees.logic.test.ts` on `test:unit`.

**Stage 8 STOP.** Next after approval: Stage 9 (side-by-side parity QA + docs) → **STOP**.

## Stage 9 — Side-by-side parity QA + docs

**Shipped:** Inventory PNG ↔ route walk (36 files / 35 unique); automated hard-colors + Stage 7–8 unit tests green; `docs/11` synced (tokens, import, scoreboard completions); `completeContext` narrative + change log; residual debt below. **Program closed.**

### Residual debt (not Stage 9 blockers)

| Debt | Note |
| --- | --- |
| Realtime scoreboard | ENGINEERING_RULES D10; shipped 15s `LiveRefresh` |
| Paid attendee import | Free-only `importGate` |
| No-PNG organizer surfaces | Tokens only (notifications, chatbot, wizard, …) |
| Recruitment FormBuilder body | Deferred (shell chrome only) |
| Scoreboard hint fairness | docs/11 Part 6 — hint-used flag only |

**Stage 9 STOP.** Design-parity Stages 0–9 complete. No Stage 10 unless a new plan opens.

---

## Resume notes

**Program complete.** No further design-parity stages. Open a new plan only for residual debt or unrelated work.

| Stage | Work | Status |
| --- | --- | --- |
| 0 | Design → route → component inventory | `done` |
| 1 | Token extraction → `theme.css` + WCAG table | `done` |
| 2 | Shared components + `/dev/design-system` + `docs/design-system.md` | `done` |
| 3 | Organizer shell + left tabs (STOP every 3) | `done` (Batches 1–4) |
| 4 | Event tabs (STOP every 4) | `done` (Batches 1–4) |
| 5 | Public/auth/marketing/admin token pass | `done` (Batches 1–3) |
| 6 | Lint/CI hard-color purge | `done` |
| 7 | Live scoreboard root-cause + fix + tests | `done` |
| 8 | Full attendee import (template → map → validate → import → undo → emails) | `done` |
| 9 | Side-by-side parity QA + docs 11 / `completeContext` | `done` |
