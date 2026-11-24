# Design system (product UI)

**Purpose:** Contract for organizer/dashboard UI built on Stage 1 tokens. Pair with [`design-parity.md`](design-parity.md) for screen inventory and WCAG. Living gallery: [`/dev/design-system`](../src/app/dev/design-system/page.tsx) (non-production + platform admin only).

**Tokens:** [`src/styles/theme.css`](../src/styles/theme.css) (imported from [`src/app/globals.css`](../src/app/globals.css)). Marketing shells keep scoped `--mkt-*` — do not mix into product primitives.

---

## Token map (product)

| Token | Role |
| --- | --- |
| `--paper` / `--canvas` | Cards vs page background |
| `--line` / `--line-loud` | Hairlines vs field borders |
| `--ink` / `--ink-soft` / `--ink-faint` | Text hierarchy (AA body on paper/canvas) |
| `--primary` / `--primary-hover` / `--primary-foreground` | Brand emerald CTA |
| `--accent` / `--accent-strong` / `--accent-soft` | Links / interactive state (not decoration) |
| `--success` / `--warning` / `--danger` (+ soft/line) | Status — never sole channel |
| `--series-1..3` | Charts only (cap three; no status hues) |
| `--rail-*` / `bg-rail` `text-rail-fg` `text-rail-muted` `bg-rail-active` `bg-rail-accent` | Left nav (`DashboardNav`) — Stage 3 Batch 1 |
| `--panel-bg` / `--panel-fg` | Loud dark panel (`.ink-panel`) |

Utilities: `bg-paper`, `text-ink`, `bg-primary`, `border-line`, etc. via Tailwind `@theme` aliases.

---

## Recipes (`src/lib/ui.ts`)

Prefer these strings on `<button>`, `<Link>`, `<SubmitButton>`, raw inputs:

| Helper | Use |
| --- | --- |
| `buttonClass(variant, size)` | `primary` \| `secondary` \| `ghost` \| `destructive` |
| `fieldClass` | inputs / selects / textareas |
| `labelClass` | field labels |
| `tableHead` / `tableCell` / `tableRow` | dense tables |

Primary is **filled brand emerald**. Destructive is **outlined** — ConfirmDialog is the safety layer. Never use `brightness()` for hover (breaks dark mode).

Component wrapper: [`Button`](../src/components/ui/Button.tsx) mirrors the same variants (`danger` → outlined destructive).

---

## Component catalog

### Prefer `src/shared_components/ui/` (new UI)

| Component | Notes |
| --- | --- |
| `Card` / `CardBody` | Tones: `flat` \| `raised` \| `panel`. Canonical card. |
| `StatusBadge` | Status pills via `statusMeta` — icon + label + hue |
| `EmptyState` | Dashed empty region |
| `MetricTile` | Stat cell with sublabel / facts |
| `DataTable` | **Server Component** — do not mark `"use client"` |
| `ClientDataTable` | Row clicks only |
| `ConfirmDialog` | Native `<dialog>` confirms |
| `FilterTabs` / `SearchField` / `PageHeader` / `ThemeToggle` | List chrome; `PageHeader` accepts optional `eyebrow` |

### Form kit `src/components/ui/` (until consolidated)

| Component | Notes |
| --- | --- |
| `Button`, `Input`, `Select`, `Badge`, `Modal` | Auth/forms + locked-module panels |
| `Card` | Re-exports shared tones; keeps `CardHeader` / `CardContent` helpers |

New product UI should import from `shared_components/ui` first.

---

## Anti-patterns

- Hardcoded hex or `gray-*` / `neutral-*` for chrome that should flip with theme
- `hover:brightness-*` on theme-aware fills
- Chromatic Tailwind utilities (`text-red-*`, `bg-purple-*`, …) — use `text-danger` / `bg-danger-soft` / `series-*` / primary tokens (enforced by `npm run check:hard-colors`)
- Filled danger buttons that skip ConfirmDialog
- Using marketing `#059669` as small link text on paper (~3.77:1 — fails AA); product `--accent` is `#047857`
- Hardcoding `gray-900` rail — use `bg-rail` / `--rail-*` (Stage 3 Batch 1)
- Inventing primitives for one-off page chrome

---

## Validate

1. Run the app locally (`NODE_ENV !== production`).
2. Sign in as platform admin.
3. Open `/dev/design-system` — toggle light/dark; check buttons, cards, badges, modal/confirm.
4. Contrast pairs: [`design-parity.md`](design-parity.md) § Stage 1 WCAG.
5. `npm run check:hard-colors` — zero chromatic utility hits in `src/**/*.{ts,tsx}` (also runs in `test:unit`).
