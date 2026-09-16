# 04   Page Specifications

Every page below assumes the components from `03-COMPONENTS.md` already
exist. Build in the order given in `05-BUILD-PLAN.md`, not the order
listed here (this file is organized by route for reference, not by
priority).

Every page must implement all four states unless noted: **loading**
(skeletons matching the eventual layout, never a spinner alone),
**empty** (specific copy, not generic), **error** (message + "Retry"
button   simulate by having the service occasionally reject in dev, or by
a manual "force error" toggle in Settings for demo purposes), **loaded**.

---

## Operations   `/operations`

`PageHeader` title "Operations", description "All active and historical
operations." Actions slot: "New Operation" button (opens a dialog that
visually collects a name/priority/location and closes without persisting
anything   label it clearly as prototype-only if you add any hint text).

Toolbar: search input (filters by name/id client-side), status filter
(multi-select: active/standby/completed/suspended), priority filter
(multi-select), "Clear filters" tertiary button that appears only when a
filter is active and shows the active filter count.

`DataTable` columns: ID, Operation (name), Status (`StatusBadge`),
Priority (`PriorityBadge`), Location (name, resolved from `locationId`),
Personnel (count, e.g. "8"), Started (relative + absolute on hover),
Last update (relative).

Row click → opens `Drawer` with operation summary (name, id, status,
priority, location, start time, last updated, assigned personnel as a
short list of names/ids, associated assets as a short list, a 3–5 item
`ActivityList` of recent related audit/comm events) and a footer "Open
full details" button → navigates to `/operations/:id`.

Empty state (all filtered out): "No operations found." / "Try adjusting
your filters or search terms."

---

## Operation Detail   `/operations/:id`

`PageHeader` with operation name as title, `StatusBadge` + `PriorityBadge`
inline, description shows location + id. Tabs: **Overview**, **Personnel**,
**Assets**, **Communications**, **Activity**.

- Overview: key fields (status, priority, location, started, last
  updated, description) laid out as a clean two-column definition list,
  not a card grid.
- Personnel tab: table of assigned personnel (reuse `DataTable` with a
  reduced column set: ID, name, status, unit), row click navigates to
  `/personnel/:id`.
- Assets tab: same pattern for assigned assets, row click navigates to
  `/assets/:id`.
- Communications tab: filtered `Communications` list scoped to this
  operation (reuse the list rendering from the Communications page, not a
  new layout).
- Activity tab: full `ActivityList` of every audit/comm event referencing
  this operation, chronological.

If the `:id` doesn't resolve to a real operation, render a not-found state
with a "Back to Operations" link   do not crash or render blank.

---

## Map   `/map`

`PageHeader` title "Map", description "Live view of operations, assets,
and locations." The `OperationsMap` is the dominant element (majority of
viewport height, not squeezed under other content). A slim filter row
above it: toggle layers (Locations / Operations / Assets   all on by
default), no other controls needed.

Clicking any marker opens `AssetPanel`/`Drawer` with fields appropriate to
what was clicked (asset fields per the Assets section below, operation
fields per Operations, location just name + kind + counts of
operations/assets/personnel currently there).

Below or beside the map (secondary, smaller): a plain list of locations
with name + counts, so the page works even for someone who wants text over
visual scanning.

---

## Personnel (Officers)   `/personnel`

`PageHeader` title "Officers". Toolbar: search (name/id), status filter,
unit filter. `DataTable` columns: ID, Name, Status (`StatusBadge`), Unit,
Assignment (operation name or "Unassigned"), Location, Last activity
(relative).

Row click → `Drawer` with: id, name, status, unit, current assignment
(linked), location, and a recent-activity `ActivityList` (status changes,
assignment changes, check-ins   synthesize 2–4 plausible generic entries
per person from the audit log data, not per-person medical or personal
detail). Footer "Open full details" → `/personnel/:id` for the same
content as a full page (this entity doesn't need extra tabs   the drawer
content and the detail page are the same, just the drawer is faster to
reach).

Do not add any field beyond what's listed above   no personal contact
info, no biographical detail, nothing resembling real personnel records.

---

## Assets   `/assets`

`PageHeader` title "Assets". Toolbar: search, type filter (vehicle /
equipment / field-device / comms-device), status filter (active / idle /
offline). `DataTable` columns: ID, Name, Type, Status (`StatusBadge`),
Location, Assigned operation (or "Unassigned"), Last updated (relative).

Row click → `Drawer`: id, name, type, status, location, assigned
operation (linked), last updated. Same "detail page mirrors drawer"
pattern as Personnel   `/assets/:id` is optional if time is short, but if
built, no additional tabs needed.

---

## Locations   `/locations`

Can be a standalone simple list page (name, kind, counts of
operations/personnel/assets currently there, click → same location detail
used by the Map page) or folded entirely into the Map page's secondary
list. **Pick one and be consistent**   if you fold it into Map, remove
`/locations` from the sidebar rather than leaving a near-duplicate page.

---

## Communications   `/communications`

`PageHeader` title "Communications", description "Operational updates and
status messages." Toolbar: search, category filter, date range (simple:
Today / Last 7 days / Last 30 days), unread-only toggle.

List (not a table   these are message-like, use a list layout): each item
shows unit/operation name, relative timestamp, category tag, message text,
and a read/unread visual (dot or bold vs. regular weight   never color
alone). Click marks read and can optionally expand for full text if
truncated.

Empty state: "No communications match your filters."

---

## Medical   `/medical`

This page communicates restricted access, not a data-entry or browsing
tool. `PageHeader` title "Medical Information". Immediately below the
header, a restrained notice: "Restricted information. Authorized personnel
only." (not a giant warning banner   a single-line, calm notice, styled
with the info-blue accent, not red).

Below that: three `StatCard`s from `MedicalSummary`   Cleared, Monitoring,
Attention   plus `lastUpdatedAt`. Nothing else on this page. Do not add a
personnel list, search, or any per-person data here, ever.

---

## Audit Logs   `/audit-logs`

`PageHeader` title "Audit Logs". Toolbar: search (actor/resource), action
filter, resource type filter, date range. `DataTable` columns: Timestamp,
Actor, Action, Resource (resourceLabel, linked to the underlying entity
where possible), Result (`StatusBadge`-style but using success=green/
failure=red text badges, not the operational status palette   visually
distinct enough not to be confused with operation status).

Row click → `Drawer`: Event ID, full timestamp, actor, action, resource,
result, and   if present   previous/new state shown as a simple two-column
before/after list.

---

## Settings   `/settings`

Sections: **Appearance** (light/dark/system toggle   wires to `useTheme`),
**Notifications** (toggle switches, visual only), **Interface
preferences** (density is fixed per the design system, so this section can
just be a placeholder or omitted   don't invent a density toggle that
contradicts `01-DESIGN-SYSTEM.md`), **Account** (static display of the
mock current role   Admin/Officer/Supervisor   as a read-only selector
that changes what the sidebar/role-gated UI shows, clearly not real auth),
**System information** (static build/version text).

---

## Dashboard   `/` (build this after every module above has its data
service working, since it composes all of them)

`PageHeader`: "Central Intelligence   Operations Overview" with current
date and the system status indicator repeated inline.

Four `StatCard`s only: Active Operations (count + "+N today"), Personnel
(count + "N active"), Assets (count + "N active"), Alerts (count + "N
requiring attention").

Then, in clear descending visual weight:
1. **Active Operations**   compact `DataTable` (or a reduced list view),
   top 5–8 by priority/recency, "View all" link to `/operations`.
2. **Map**   smaller embedded instance of `OperationsMap` (reuse the
   component, don't fork it), "Open full map" link to `/map`.
3. **Alerts**   list of unacknowledged alerts by severity, "View all"
   link/expand.
4. **Recent Activity**   `ActivityList`, last 8–10 events across
   audit/comms.

Do not give these four sections equal visual weight   Active Operations
and Map should be visually larger/more prominent than Alerts and Recent
Activity, per the design system's hierarchy principle.
