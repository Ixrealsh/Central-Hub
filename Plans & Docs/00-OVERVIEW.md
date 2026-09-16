# Central Intelligence Dashboard   Build Docs

**Read this file first, every time, before touching code.**

This is a documentation set for an AI coding agent implementing a frontend-only
UI prototype. It replaces a single giant prompt with five scoped documents so
you only ever need to hold one phase in your head at a time.

## How to use these docs

Read in this order, and **only load the next file when you start that phase**:

1. `00-OVERVIEW.md`   this file. Constraints, stack, folder layout.
2. `01-DESIGN-SYSTEM.md`   tokens, colors, type scale, states. Read before any UI.
3. `02-DATA-MODEL.md`   types, mock data, service layer. Build this first.
4. `03-COMPONENTS.md`   shared component contracts. Build these second.
5. `04-PAGES.md`   one spec per route. Build pages third, one at a time, in
   the order listed in `05-BUILD-PLAN.md`.
6. `05-BUILD-PLAN.md`   the ordered checklist with definition-of-done per
   phase. This is your task list. Do not skip ahead in it.

**Do not read all five files and try to build everything at once.** Work
phase by phase from `05-BUILD-PLAN.md`. Each phase tells you exactly which
of the other docs to consult and what "done" looks like before moving on.

If anything in a later doc seems to contradict this file or the design
system, this file and `01-DESIGN-SYSTEM.md` win. Stop and flag the
contradiction rather than guessing.

## What this product is

A fictional, internal-style **operations command console**   the kind of
tool a security, logistics, or emergency-response organization would use to
see active operations, personnel, assets, and alerts in one place. Think
"professional enterprise ops software," not "military HUD" and not "generic
admin template."

Treat every entity name as a placeholder for a real-world neutral operations
context (dispatch, field logistics, incident response)   not literally a
police or military product. Keep labels professional and generic
("Personnel," "Field Units," "Operations Center") rather than leaning into
paramilitary styling, iconography, or copy.

## Absolute constraints (non-negotiable, apply to every phase)

- **No backend.** No real database, no real auth, no real API calls, no
  network requests of any kind.
- **No real data, ever.** Every operation, person, asset, message, and log
  entry is fictional. No real names, no real coordinates, no real
  addresses, no data resembling a real person.
- **No real location tracking.** Map coordinates are an abstract 0–100 grid,
  not latitude/longitude, and are never framed as real-world positions.
- **Medical data is aggregate-only.** Never create per-person medical
  records or details   only the three summary counters defined in
  `02-DATA-MODEL.md`.
- **Frontend role switching is cosmetic only.** If you build a role
  switcher, its UI must make clear (in this doc's language, not the UI
  copy) that it demonstrates what different views *would* look like   it
  is not real authorization and must never be described to the user as
  providing security.
- **Do not add dependencies not listed in this doc** without stopping and
  flagging why the listed stack can't do the job.

## Tech stack (pinned   do not substitute)

| Concern | Choice |
|---|---|
| Build tool | Vite |
| Framework | React 18 + TypeScript (`strict: true`) |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| Component primitives | shadcn/ui (Radix-based)   Dialog, Tabs, Tooltip, Select, Popover |
| Command palette | `cmdk` |
| Icons | `lucide-react` |
| Map | Custom-built SVG component   **no map library** (see `03-COMPONENTS.md`) |
| State | React Context + hooks only   **no Redux/Zustand/Jotai** |
| Fonts | Inter (self-hosted or `@fontsource/inter`) |

Do not install a chart library. Nothing in this product needs a chart.

## Folder structure (create exactly this shape)

```
src/
  app/
    App.tsx
    router.tsx
  components/
    ui/              # shadcn primitives live here
    layout/          # AppShell, Sidebar, Topbar, PageHeader
    data-display/    # DataTable, StatCard, StatusBadge, PriorityBadge, ActivityList
    map/             # OperationsMap, MapMarker, AssetPanel
    search/          # CommandPalette
  data/
    seed.ts          # single source of truth, generates all fixtures together
    operations.ts
    personnel.ts
    assets.ts
    locations.ts
    communications.ts
    auditLogs.ts
    alerts.ts
  types/
    operation.ts
    personnel.ts
    asset.ts
    location.ts
    communication.ts
    audit.ts
    alert.ts
    medical.ts
  services/
    operations.service.ts
    personnel.service.ts
    assets.service.ts
    locations.service.ts
    communications.service.ts
    audit.service.ts
    alerts.service.ts
    medical.service.ts
  hooks/
    useTheme.ts
    useDrawer.ts
    useCommandPalette.ts
  pages/
    DashboardPage.tsx
    OperationsPage.tsx
    OperationDetailPage.tsx
    MapPage.tsx
    PersonnelPage.tsx
    PersonnelDetailPage.tsx
    AssetsPage.tsx
    AssetDetailPage.tsx
    LocationsPage.tsx
    CommunicationsPage.tsx
    MedicalPage.tsx
    AuditLogsPage.tsx
    SettingsPage.tsx
  styles/
    tokens.css
    index.css
```

Do not put page content directly in `App.tsx`. Do not create a components
folder per page   shared pieces live in the folders above; page-only
sub-components (rare) live next to their page file as `PageName.SubPart.tsx`.

## ID and naming conventions (apply everywhere, do not deviate)

- Operations: `OP-001`, `OP-002` … zero-padded to 3 digits.
- Personnel: `OFF-1024`, `OFF-1025` … 4-digit, starting at 1024.
- Assets: `AST-021`, `AST-022` … 3-digit, starting at 021.
- Audit events: `EVT-83921` … 5-digit, no fixed start.
- Locations: `LOC-01`, `LOC-02` … 2-digit.
- Alerts: `ALT-001` … 3-digit.
- Fictional personnel display names: invented full names (e.g. "Naa Adjei,"
  "Kwame Boateng," "Efua Mensah")   never "Test User," never "Officer 1,"
  never a real public figure's name.
- All timestamps are ISO 8601 strings, generated relative to a single fixed
  "now" defined once in `seed.ts` so the whole dataset stays internally
  consistent across a session (do not use `Date.now()` scattered through
  multiple files).
