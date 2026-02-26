# UI Styleguide — Stalingrad War-Room Console

## 1) Design intent

Interface language is based on a wartime staff archive workstation:

- **Dark, paperless archive console** (not neon sci-fi, not generic SaaS dashboard).
- **High information density** with strict hierarchy.
- **Operational texture** with very subtle grid/noise/scanlines.
- **Table-first reading model** for battalion records and company-level details.

## 2) Typography

- UI text: **IBM Plex Sans**
- Numeric and key fields: **IBM Plex Mono**
- Numeric columns use `font-variant-numeric: tabular-nums`
- Uppercase metadata labels use letter-spacing and reduced size (archive labels)

## 3) Tokens (CSS variables)

Core tokens live in `src/ui/theme/tokens.css`.

### Color tokens

- Background layers: `--bg0`, `--bg1`, `--bg2`
- Foreground hierarchy: `--fg0`, `--fg1`, `--fg2`
- Lines: `--line0`, `--line1`
- Accent: `--accent` (single restrained highlight)
- Status: `--good`, `--warn`, `--bad`
- Theater colors: `--soviet`, `--axis`, `--mapAxis`

### Shape / spacing / elevation

- Radius: `--radius2`, `--radius4`, `--radius6`
- Spacing scale: `--space1..--space6` (4px base)
- Elevation: `--shadow-soft`, `--shadow-popover`

### Density

- `data-density="compact"` → dense military table mode
- `data-density="comfortable"` → more readable inspection mode

## 4) Texture system

- Noise layer generated at runtime (`src/ui/theme/noise.ts`)
- Faint 32px alignment grid overlay
- Minimal scanline overlay
- All layers stay low-opacity to avoid visual fatigue

## 5) Component rules

Reusable primitives are mandatory and live under `src/ui/components/`:

- `Button` (solid / ghost / outline, sm / md)
- `Badge` + `BadgeButton` (from_source / generated_by_template / confidence)
- `Input` + `Select`
- `ToggleGroup`
- `Panel`
- `Kbd`
- `Tooltip`, `Popover`, `Dialog`
- `Divider`
- `ScrollArea` (uniform scrollbar)

Interaction states:

- hover / active / focus-visible / disabled / selected are explicitly styled.
- touch interactions avoid default tap highlight and preserve state feedback.

## 6) Table standards

### SummaryTable

- Powered by **TanStack Table**.
- Required fields are always present (missing values shown as `—`).
- Sorting on key columns.
- Column visibility toggle via popover.
- Source column opens citation panel with confidence and URL.

### CompanyTable

- Tree rows: Company → Platoon → Squad (extensible).
- Powered by **TanStack Table + TanStack Virtual**.
- Sticky header + virtualized body.
- First column pinned for context while horizontal scrolling.
- Hover row actions: copy / expand all / collapse all.

## 7) Copy & wording style

Avoid generic dashboard language. Use archive-style operational wording:

- `NO UNIT SELECTED`
- `NO DATA FOR THIS SNAPSHOT`
- `FIELD UNVERIFIED`
- `GENERATED FROM TEMPLATE`
- `SOURCE UNVERIFIED`
