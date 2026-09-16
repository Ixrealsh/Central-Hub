# 01   Design System

Read this before writing any component. Every visual decision in the app
must trace back to a value defined here. If you need a value that isn't
here, add it to this file first, then use it   never invent an inline
one-off value in a component.

## Typography

Font: **Inter**, loaded once globally.

| Role | Size | Weight | Line height |
|---|---|---|---|
| Page title | 20px | 600 | 28px |
| Section title | 15px | 600 | 22px |
| Body | 13.5px | 400 | 20px |
| Secondary / metadata | 12px | 400 | 16px |
| KPI number | 26px | 600 | 32px |

Do not introduce any other font size. If a design need doesn't fit these
five, it's using the wrong role, not a new size.

## Spacing scale

Use Tailwind's default scale but constrain yourself to these steps for
layout: `1, 2, 3, 4, 6, 8, 12, 16` (i.e. 4px–64px). Do not use arbitrary
`p-[13px]`-style values.

## Radius scale

| Token | Value | Use |
|---|---|---|
| `radius-sm` | 6px | badges, small controls |
| `radius-md` | 8px | inputs, buttons |
| `radius-lg` | 10px | cards, table containers |
| `radius-xl` | 12px | drawers, dialogs |

Never mix radii within one component family (e.g. all badges use `sm`,
always).

## Shadows

One shadow token only, used sparingly (drawers/dialogs/popovers on open):

```css
--shadow-elevated: 0 4px 16px -4px rgb(0 0 0 / 0.12), 0 2px 4px -2px rgb(0 0 0 / 0.08);
```

Cards and tables get elevation from a 1px border and a subtle surface
color difference   never a shadow.

## Color tokens

Define as CSS variables in `styles/tokens.css`, mapped into
`tailwind.config.ts` `theme.extend.colors`. Light values first, dark
overrides under `.dark`.

```css
:root {
  --bg: #FAFAFA;
  --surface: #FFFFFF;
  --surface-raised: #FFFFFF;
  --border: #E4E4E7;
  --text-primary: #18181B;
  --text-secondary: #71717A;

  --accent-blue: #2563EB;
  --accent-green: #16A34A;
  --accent-amber: #D97706;
  --accent-red: #DC2626;

  --accent-blue-bg: #EFF6FF;
  --accent-green-bg: #F0FDF4;
  --accent-amber-bg: #FFFBEB;
  --accent-red-bg: #FEF2F2;
}

.dark {
  --bg: #0B0D0F;
  --surface: #111418;
  --surface-raised: #15181C;
  --border: #24282D;
  --text-primary: #F2F4F7;
  --text-secondary: #9299A3;

  --accent-blue: #3B82F6;
  --accent-green: #22C55E;
  --accent-amber: #F59E0B;
  --accent-red: #EF4444;

  --accent-blue-bg: #14202E;
  --accent-green-bg: #10241A;
  --accent-amber-bg: #2A2011;
  --accent-red-bg: #2A1414;
}
```

### Semantic color rules

- **Green** = active / healthy / success. Nowhere else.
- **Amber** = warning / needs attention. Nowhere else.
- **Red** = critical / failed / urgent. Nowhere else.
- **Blue** = informational / selected / navigation emphasis only.
- Never use an accent color as a full-bleed background on a card, row, or
  section. Accents appear as: badge fill (using the `*-bg` token with the
  solid color as text/icon/dot), a 2–3px left border on an alert, or a
  small status dot. That's the full list of places color-as-meaning is
  allowed to appear.
- Status must **never** be color-only. Every status badge carries a text
  label; every alert severity carries a label and, where space allows, an
  icon (see icon rules below).

## Component states (every interactive component must implement all of these)

| State | Rule |
|---|---|
| Default | as designed |
| Hover | background shifts to `--surface-raised` or `--border` at low opacity; no scale/shadow change |
| Active/pressed | slightly darker than hover, no movement |
| Focus-visible | 2px `--accent-blue` outline, 2px offset   never remove `:focus-visible` styles |
| Selected | left border or background tint using `--accent-blue-bg`, plus an icon/checkmark where relevant   never color alone |
| Disabled | 40% opacity, `cursor: not-allowed`, no hover state |

## Icons

`lucide-react` only. Default size 16px inline with text, 18–20px for
standalone action icons. Decorative icons get `aria-hidden="true"`. No
emoji anywhere in the UI, including placeholder/empty states.

Do not place an icon next to every label. Icons appear for: nav items,
status dots, alert severities, primary table row actions, and empty/error
state illustrations (icon-only, never a decorative image).

## Buttons

| Variant | Look | Use |
|---|---|---|
| Primary | solid `--accent-blue` fill, white text | one per view/section max |
| Secondary | 1px border, transparent fill | most actions |
| Tertiary | text-only, no border | low-emphasis actions ("Clear filters") |
| Destructive | solid `--accent-red` fill | reserved, rare |

Button label copy is always a verb phrase describing the result: "View
details," "Apply filters," "Retry," "Acknowledge alert"   never "Submit,"
"OK," "Click here."

## Animation

- Durations: 120ms (hover/focus), 180ms (dropdowns/popovers), 220ms
  (drawers/dialogs). Nothing longer.
- Easing: `ease-out` for entrances, `ease-in` for exits.
- Wrap all transitions in a check for `prefers-reduced-motion: reduce` and
  disable non-essential motion when set.
- No entrance animation on page load for static content (cards, tables).
  Motion is reserved for state changes the user caused (open/close/hover).

## Dark mode

Implemented via a `.dark` class on `<html>`, toggled by `useTheme`, and
persisted in memory only (no `localStorage`   see note in
`03-COMPONENTS.md` on the storage restriction). Every color in this doc has
a dark override; do not ship a component that only has light-mode colors.

## Density

Table row height: 44px. Card padding: 16px. Page horizontal padding: 24px
desktop / 16px mobile. This is the one density scale for the whole app  
don't introduce a "compact" and "comfortable" mode, that's out of scope.
