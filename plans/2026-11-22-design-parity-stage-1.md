# Design parity — Stage 1 tokens (STOP)

**Status:** Stage 1 done — tokens in [`src/styles/theme.css`](../src/styles/theme.css); WCAG table in [`docs/design-parity.md`](../docs/design-parity.md). Awaiting approval before Stage 2.

## Decision (locked)

Design PNGs and marketing use **emerald/forest**; product `:root` remapped from **violet/indigo** to the same greens. Raw tokens live in `theme.css`; `@theme` aliases and marketing `--mkt-*` stay in `globals.css`. Hardcoded gray rail in `DashboardNav` waits for Stage 3. `--rail-*` tokens are reserved for that pass.

`--accent` is `#047857` (AA body), not marketing `#059669` (~3.77:1 on paper — fails AA as small text).

## Deliverables shipped

1. [`src/styles/theme.css`](../src/styles/theme.css) — light + dark product tokens, legacy aliases, console rhythm, rail placeholders  
2. [`src/app/globals.css`](../src/app/globals.css) — `@import "../styles/theme.css"`; duplicated `:root` / dark blocks removed  
3. WCAG + bridge tables in [`docs/design-parity.md`](../docs/design-parity.md)  
4. Context + this archive entry  

## Out of scope (STOP)

No component/page restyles; no `/dev/design-system`; no Stages 3–9.

## Next

Stage 2 — shared components + `/dev/design-system` + `docs/design-system.md` → STOP.
