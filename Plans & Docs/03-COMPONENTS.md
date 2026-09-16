# 03   Shared Component Contracts

Build these before any page. Every page in `04-PAGES.md` is written
assuming these components already exist with exactly this behavior   don't
redesign them per-page.

**Storage note:** if you use browser storage anywhere (theme preference,
drawer state, anything), do not use `localStorage`/`sessionStorage` if this
runs inside a Claude Artifact sandbox   it's unsupported there. Use React
state/Context for everything; it's fine for this to reset on refresh in a
prototype.

## Layout

### `AppShell`
Wraps every route. Renders `Topbar` + `Sidebar` + a content region. Owns
no data   purely structural.

### `Topbar`
- Left: wordmark/logo (text-based, no invented logo graphic needed).
- Center-left: global search input, placeholder `"Search operations,
  officers, assets, locations…"`, opens `CommandPalette` on click or on
  `Cmd/Ctrl+K` from anywhere in the app.
- Right: notifications bell (badge count = unacknowledged alerts, opens a
  popover listing them, "View all" links to a dedicated alerts view),
  help icon (static tooltip is fine), account menu (static   role display
  only, see role note in `00-OVERVIEW.md`).

### `Sidebar`
Grouped nav, collapsible on tablet, replaced by a compact bottom or drawer
nav on mobile. Groups and items, in order:

```
OVERVIEW        Dashboard
OPERATIONS      Operations, Map
PERSONNEL       Officers
ASSETS          Assets, Locations
INTELLIGENCE    Communications, Medical
ADMINISTRATION   Audit Logs, Settings
```

Bottom of sidebar: system status row   a status dot (`green` = "System
operational") plus label. This is a static/mock indicator; it does not
need to reflect anything computed for this prototype.

Active item: left accent border (`--accent-blue`) + `--accent-blue-bg`
background tint + medium font weight. Not a solid color block.

### `PageHeader`
Props: `title`, optional `description`, optional `actions` (right-aligned
button slot). Used at the top of every page for consistency   don't
hand-roll a header per page.

## Data display

### `DataTable<T>`
Generic, reusable across Operations/Personnel/Assets/Audit Logs.

```ts
interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode; // defaults to row[key]
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  selectedRowId?: string;
  isLoading?: boolean;
  emptyState: { title: string; description: string };
}
```

Must implement: sortable column headers (click to toggle asc/desc, small
arrow indicator), row hover state, selected-row state (left border +
tinted background, matching the design system's selected-state rule),
sticky header on scroll, skeleton rows when `isLoading`, and the passed
`emptyState` when `data.length === 0` and not loading. Pagination: simple
"Showing X–Y of Z" with prev/next   no page-number list needed at this
data scale.

### `StatusBadge`
Maps a status string to a colored pill using the semantic color rules from
`01-DESIGN-SYSTEM.md`. One mapping table, reused everywhere a status
appears   do not restyle status per page.

| Status | Color |
|---|---|
| active | green |
| standby | blue |
| completed | gray (neutral, uses `--text-secondary`, not an accent) |
| suspended | amber |
| idle | blue |
| offline | red |
| off-duty | gray |
| unavailable | amber |

### `PriorityBadge`
| Priority | Color |
|---|---|
| low | gray |
| medium | blue |
| high | amber |
| critical | red |

### `StatCard`
Props: `label`, `value`, optional `delta` (e.g. "+3 today"), optional
`onClick`. Used only on the dashboard, four instances max. Number uses the
"KPI number" type scale from the design system   not larger.

### `ActivityList`
Props: `items: { id: string; timestamp: string; description: string }[]`.
Renders a simple chronological list (time on the left, description on the
right), used on the dashboard and inside detail drawers. Not a timeline
graphic   plain, scannable rows.

## Overlays

### `Drawer` (side panel)
Used for quick inspection (operation summary, asset detail, audit event
detail). Props: `open`, `onClose`, `title`, `children`, optional
`footerAction` (e.g. an "Open full details" link/button). Slides in from
the right, 220ms ease-out, dims background with a low-opacity scrim,
closes on `Escape` and on scrim click, returns focus to the triggering
element on close. Build on shadcn's Dialog/Sheet primitive   don't
hand-roll focus trapping.

### `CommandPalette`
Built on `cmdk`. Opens on `Cmd/Ctrl+K` or clicking the topbar search.
Results grouped by entity type with group headers (`OPERATIONS`,
`PERSONNEL`, `ASSETS`, `LOCATIONS`, `AUDIT EVENTS`), each result shows an
id + name. Keyboard: arrow keys move selection, `Enter` navigates,
`Escape` closes. Empty query: show a short list of recent/suggested items
or nothing   never an error. No-results: "No results for '{query}'" with
a suggestion to check spelling   never a blank panel.

## Map

### `OperationsMap`
**Custom SVG component, not a map library.** Renders a stylized abstract
map surface (a subtle grid or a few soft region shapes   not a real
geographic silhouette) sized to a `viewBox="0 0 100 100"` so every
`Location`'s `x`/`y` (already 0–100) plots directly. Plots `MapMarker`s for
locations, and optionally overlays operation/asset markers positioned near
their location with slight jitter so multiple items at one location don't
fully overlap.

### `MapMarker`
Props: `x`, `y`, `kind` (`"location" | "operation" | "asset"`), `status`
(drives color via the same semantic mapping as `StatusBadge`), `label`,
`onClick`. Renders as a small circle/pin with a `title`/tooltip on hover
and an accessible `<button>` wrapper (map markers must be keyboard-focusable
and activatable with `Enter`, not click-only).

### `AssetPanel`
Slide-in detail panel (reuses `Drawer`) triggered by clicking a marker.
Shows the fields listed in the Assets page spec in `04-PAGES.md`.

## Definition of done for this phase

- [ ] Every component above exists, typed, with no `any`
- [ ] Every interactive component supports keyboard focus and
      `focus-visible` styling per the design system
- [ ] `DataTable`, `Drawer`, and `CommandPalette` each have a Storybook-free
      manual smoke test page or story is not required   but each must be
      exercised by at least one real page before this phase is marked done
- [ ] No page-specific styling leaked into these shared components   if a
      page needs something different, that's a prop, not a fork
