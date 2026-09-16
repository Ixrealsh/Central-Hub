# 05   Build Plan

Work through phases **in order**. Do not start a phase until the previous
one's "Definition of done" is fully checked. If you're an AI agent working
across multiple sessions/context windows, re-read `00-OVERVIEW.md` and the
current phase's doc reference at the start of every session before writing
code   do not rely on memory of earlier phases.

If a phase's instructions seem to require something not covered in
`00-OVERVIEW.md` through `04-PAGES.md`, **stop and ask** rather than
inventing a pattern that might conflict with a later phase.

---

### Phase 0   Project scaffold
**Read:** `00-OVERVIEW.md`
- Scaffold Vite + React + TypeScript (strict).
- Install: `tailwindcss`, `react-router-dom`, shadcn/ui + its Radix deps,
  `cmdk`, `lucide-react`, `@fontsource/inter` (or equivalent font loading).
- Set up the exact folder structure from `00-OVERVIEW.md`.
- Configure path alias `@/` → `src/`.
- Configure ESLint + Prettier with `no-explicit-any` as an error, not a
  warning.

**Done when:** `npm run dev` shows a blank white page with no console
errors, `npm run typecheck` and `npm run lint` both pass on the empty
scaffold.

---

### Phase 1   Design tokens
**Read:** `01-DESIGN-SYSTEM.md`
- Create `styles/tokens.css` with the full light/dark variable set.
- Extend `tailwind.config.ts` to map those variables into
  `theme.extend.colors`, plus the radius scale as `theme.extend.borderRadius`.
- Wire `useTheme` (Context + hook) that toggles a `.dark` class on `<html>`.
  State only   no persistence needed.

**Done when:** a throwaway test div can use `bg-surface text-primary
border-border rounded-lg` (or your actual token names) and visibly change
between light and dark when `useTheme` toggles.

---

### Phase 2   Data layer
**Read:** `02-DATA-MODEL.md`
- Create every file in `types/`.
- Build `data/seed.ts` and the per-domain re-export files.
- Build every file in `services/`.

**Done when:** every item in that doc's "Definition of done" is checked,
and you can log `await getOperations()` from a scratch script/test and see
24 well-formed, cross-referentially consistent records.

---

### Phase 3   Shared components
**Read:** `03-COMPONENTS.md`
- Build `AppShell`, `Topbar`, `Sidebar`, `PageHeader`.
- Build `DataTable`, `StatusBadge`, `PriorityBadge`, `StatCard`,
  `ActivityList`.
- Build `Drawer`, `CommandPalette`.
- Build `OperationsMap`, `MapMarker`, `AssetPanel`.
- Wire up routing (`app/router.tsx`) with every path from `04-PAGES.md`
  pointing at a placeholder page (just the `PageHeader`, nothing else) so
  navigation is fully clickable before any real page content exists.

**Done when:** you can navigate the full sidebar, every route renders a
placeholder without errors, `Cmd/Ctrl+K` opens the command palette with
working (if sparse) results, and dark mode + focus states are visibly
correct on at least `DataTable` and `Drawer` in isolation.

---

### Phase 4   Operations module (the reference implementation)
**Read:** the Operations and Operation Detail sections of `04-PAGES.md`
- Build `/operations` fully: table, filters, search, drawer.
- Build `/operations/:id` fully: header, tabs, all five tab contents.
- Implement loading/empty/error states for this page specifically  
  **this is where you establish the pattern** every later page will copy.

**Done when:** Operations passes the full state checklist (loading, empty,
error, loaded), keyboard nav works through the table and drawer, and you
would be comfortable calling this page "done" with no further polish.
Do not proceed to Phase 5 until this is true   every later module copies
this one's patterns, so flaws here multiply.

---

### Phase 5   Personnel and Assets
**Read:** the Personnel and Assets sections of `04-PAGES.md`
- These should be substantially faster than Phase 4: same `DataTable`,
  same `Drawer` pattern, different columns/fields.
- Do not introduce any new shared component in this phase. If you find
  yourself needing one, stop   it likely belongs in `03-COMPONENTS.md`
  and should be added there first, then adopted here.

**Done when:** both modules match Operations' state handling exactly, and
their tables/drawers are visually indistinguishable in *style* from
Operations (only the data differs).

---

### Phase 6   Map and Locations
**Read:** the Map and Locations sections of `04-PAGES.md`
- Build out `OperationsMap` with real data (it was stubbed with
  placeholders in Phase 3).
- Decide and implement the Locations approach (standalone page vs. folded
  into Map)   pick one, per that section's instruction, and remove the
  unused sidebar entry if you fold it in.

**Done when:** every location, and every operation/asset with a
location, renders a keyboard-focusable marker, and clicking any marker
opens the correct detail panel.

---

### Phase 7   Communications, Medical, Audit Logs, Alerts
**Read:** the corresponding sections of `04-PAGES.md`
- Communications and Audit Logs reuse `DataTable`/list patterns from
  Phase 4.
- Medical is intentionally small   do not expand its scope.
- Alerts has no dedicated page in this plan (it lives in the topbar
  popover + dashboard section) unless you find a real need for one; if you
  add `/alerts` as a full page, keep it to the same list pattern as
  Communications.

**Done when:** all four are functional and Medical still contains only
the three aggregate numbers   verify no per-person field crept in.

---

### Phase 8   Dashboard
**Read:** the Dashboard section of `04-PAGES.md`
- Build last among content pages, since it composes Operations, Map,
  Alerts, and Activity data that must already work standalone.

**Done when:** all four sections render with correct visual hierarchy
(Operations + Map visually dominant over Alerts + Recent Activity), and
every "View all" / "Open full map" link routes correctly.

---

### Phase 9   Settings, role display, system status
**Read:** the Settings section of `04-PAGES.md` and the role note in
`00-OVERVIEW.md`
- Build Settings.
- Make sure the role selector (if built) visibly changes something small
  and real (e.g. hides Audit Logs / Medical from the sidebar for a
  non-Admin role) so it's not purely decorative, while still being
  clearly labeled as a UI demonstration, not real access control.

**Done when:** switching the mock role changes sidebar visibility
predictably and reversibly.

---

### Phase 10   Cross-cutting polish pass
Do this as a dedicated pass across the **whole app**, not per-page:
- Responsive check at desktop / tablet / mobile breakpoints for every
  route, including the map and every table (horizontal scroll or column
  priority for narrow widths, per `00-OVERVIEW.md`'s responsive intent).
- Keyboard-only pass: tab through every page, confirm visible focus rings
  everywhere, confirm every drawer/dialog/palette traps focus and returns
  it correctly on close.
- Color-only-meaning audit: grep for every `StatusBadge`/`PriorityBadge`
  usage and confirm a label is present, not just a colored dot.
- Consistency audit: badges, buttons, radii, spacing all match
  `01-DESIGN-SYSTEM.md` exactly   fix any drift introduced during Phases
  4–9 rather than leaving "close enough."
- Remove any unused component, unused import, or dead mock-data field.

**Done when:** `npm run typecheck`, `npm run lint`, and `npm run build`
all pass cleanly with zero errors and zero warnings you haven't
deliberately suppressed with a documented reason.

---

## Final checklist (all phases complete)

- [ ] Every route in `00-OVERVIEW.md`'s folder structure exists and works
- [ ] Every page implements loading / empty / error / loaded states
- [ ] Dark mode is complete on every page, not just the shell
- [ ] No `any` in the codebase
- [ ] No unused dependency in `package.json`
- [ ] No real data, real names, real coordinates, or per-person medical
      detail anywhere
- [ ] `typecheck`, `lint`, `build` all clean
- [ ] A first-time viewer can, within 5 seconds of opening the dashboard,
      say what's active, what needs attention, and where to click next
