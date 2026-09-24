# ODMS — Chennai Metro Rail

Application shell for ODMS station operations. React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router 7 · Lucide icons.

```bash
npm install
npm run dev      # http://localhost:3002
npm run build
npm run format   # Prettier + Tailwind class sorting (format:check in CI)
```

**Class names:** plain strings and template literals. No class-merging helper. Long or shared base classes
live in named constants (e.g. `BASE`, `ITEM`), variants in `Record` maps, and conditions as ternaries
(`${active ? 'bg-muted' : ''}`). Prettier sorts the classes.

## Structure

```
src/
├── app/            App + router (routes carry breadcrumb/title in `handle`)
├── components/
│   ├── layout/     AppShell, Sidebar, SidebarItem, Topbar, MobileDrawer, PageHeader,
│   │               StationContext, ShiftContext, NotificationPanel, UserMenu, Brand
│   ├── navigation/ Breadcrumb, NavigationGroup
│   ├── search/     SearchTrigger, GlobalSearch
│   └── ui/         Button, IconButton, Tooltip, Dialog, Modal, Badge, StatusDot, Avatar, Kbd, EmptyState,
│                   Card, Field (Input/Select/Textarea/Checkbox), SegmentedControl, Pagination
├── modules/        one folder per business module (pages, components, data, types)
│   ├── station-diary/  Today, Shift Summary (table + booklet), handover, PDF export
│   └── registers/      schema-driven registers (definitions.ts) with records and history
├── constants/      navigation config, search scopes, breakpoints, mock data
├── context/        SessionContext (user/station/shift), ShellContext (layout state)
├── hooks/  pages/  types/  utils/
└── styles/index.css  design tokens
```

**Adding a module:** create `modules/<name>/` with its pages, components and a `data/` store. Add lazy routes in
`app/router.tsx` (`lazy: page(() => import(...))`) with `handle: { crumb }` (a crumb can be a function of the route
params), then set `to` and `status: 'available'` on its entry in `constants/navigation.ts`. Start each page with `<PageHeader>`.

## Modules

**Data:** each module's `data/*Store.ts` is an in-memory mock with the shape of the future API (hooks for reads,
functions for writes). Replacing a store with HTTP calls doesn't change the UI. Reloading the page resets the example data.

**Station Diary** (`/station-diary`)

- _Today:_ shift strip, hot keys (click to put a saved message in the editor; **Save as hot key** turns the typed
  message into one, **Add hot key** creates one from scratch; per station), light formatting (`**bold**`, `_italic_`, `- ` and `1. ` lists),
  image attachments, PN numbers, ★ important, `Ctrl/⌘ ↵` to log. Unsent text is kept as a per-shift draft.
  Entries are append-only; task updates, follow-ups and handover are logged by ODMS.
- _Submit & hand over_ locks the shift; past shifts open read-only at `/station-diary/shifts/:id`.
- _Shift Summary:_ yesterday/today status, entries per day, filters, Copy / Excel (CSV) and a **Booklet view** that
  shows each shift on the official form CMRL/OPER/SO/F-01.
- _Export PDF:_ this shift, whole day, or a date range (booklet, with index page). The file is a real PDF built with
  `@react-pdf/renderer` in `pdf/`, loaded only when someone exports. Every page has a faint CMRL logo watermark; unsubmitted shifts are labelled DRAFT.
  `components/DiaryFormSheet.tsx` (screen) and `pdf/DiaryPdfDocument.tsx` (PDF) draw the same form, so change them together.
  To move PDF generation to the backend, replace the body of `pdf/downloadDiaryPdf.tsx`.
  PDF fonts come from the free `@fontsource/inter` package (SIL OFL, WOFF files); the ★ marker is drawn as a vector.

**Registers** (`/registers`)

- A register is configuration in `modules/registers/definitions.ts` (fields, reference code, retention). The table,
  entry form and record panel are generated from it, so adding a register is a config change.
- Status workflow Open → In progress → Pending verification → Closed; closing needs a remark; every change goes into history.
- Diary entries on the open shift have **Create register entry**: pick the register, the form opens pre-filled, and the
  record and entry link both ways.

## Responsive behaviour

| Width       | Sidebar                          | Header                                                    |
| ----------- | -------------------------------- | --------------------------------------------------------- |
| < 768       | Drawer (menu button)             | Menu · ODMS · Search icon · Bell · Avatar + context bar   |
| 768 – 1023  | Icon rail with tooltips + drawer | Menu · Page · Search · Station/Shift chip · Bell · Avatar |
| 1024 – 1279 | Collapsible, rail by default     | Breadcrumb · Search · Station/Shift chip · Bell · Avatar  |
| ≥ 1280      | Collapsible, expanded by default | Breadcrumb · Search · Station · Shift · Bell · User       |

The sidebar preference is saved per device. Shortcuts: `⌘K` / `Ctrl K` or `/` for search, `[` to toggle the sidebar.

## Brand

- **Full CMRL lockup** (`assets/cmrl-full-logo.png`): expanded sidebar header and mobile drawer.
- **Roundel** (`assets/cmrl-logo.png`): collapsed sidebar, mobile header, favicon.
- **Product name "ODMS"**: topbar (desktop) and mobile header.
- Both logos are raster PNGs. Swap in SVG or 2× versions when available for sharper rendering on high-DPI screens.

## Fluid scale

Every size in the UI is in `rem` (Tailwind spacing, the type scale, layout tokens), and the root font size is fluid:

| Viewport | Root   | Sidebar | Topbar | Body text |
| -------- | ------ | ------- | ------ | --------- |
| ≤ 1600px | 16px   | 248px   | 56px   | 14px      |
| 1920px   | 17px   | 264px   | 60px   | 14.9px    |
| 2560px   | 19px   | 297px   | 67px   | 16.8px    |
| 3840px   | 23.4px | 363px   | 82px   | 20.5px    |

Type, spacing, icons, radii and layout therefore scale together, keeping the same proportions on every screen.
Breakpoints stay fixed in px. Borders, focus rings and outlines stay in px, so they remain crisp.
**Rule:** don't use `px` values in components. Use tokens, or `rem` for arbitrary values.

## Themes

Light (default, primary theme), Dark, and System (follows the OS, live) — chosen in the user menu and saved per device (`odms.theme`).
An inline script in `index.html` sets `<html data-theme>` before first paint, so there is no flash.
Dark mode re-values the same tokens under `:root[data-theme='dark']` in `styles/index.css`; components never
branch on theme. Use `dark:` only for artwork (the CMRL logos render reversed/white in dark mode — swap in
official reversed artwork when available). Text tokens meet WCAG AA (≥ 4.5:1) in both themes.

## Visual language

- **Navy navigation:** the sidebar and mobile drawer use `bg-nav` (CMRL transit navy) with the `.on-dark` class.
  `.on-dark` re-values the standard tokens for everything inside it, so components keep their usual classes.
  The `dark:` variant also applies inside `.on-dark`; use it only for artwork, such as the reversed logos.
- **Hairlines:** `border` and `border-strong` are translucent, so they sit cleanly on any surface.
- **Elevation:** resting panels use `shadow-card` (a slight lift in light, a faint top highlight in dark).
  `shadow-overlay` is for popovers and dialogs only.
- **Type:** Inter with optical sizing (`opsz` axis): the display cut for titles, the open text cut for small sizes.
- **Live state:** `<StatusDot live />` pulses slowly for "happening now" (the active shift). It stops when reduced motion is on.
- **Contrast:** all text tokens meet WCAG AA (≥ 4.5:1) in both themes and on navy.

## Look: Station Signage

Chosen from the visual refresh preview: neutral greys, deep navy and signal yellow, like metro wayfinding signs.

- **Page header:** every `<PageHeader>` is a navy bar with a yellow left edge (`bg-header`, `border-accent`).
  The `.on-header` scope re-values tokens inside it, so text turns white and the primary action turns yellow.
- **Accent:** `accent` (signal yellow) for the page-header edge and action, the active tab and the sidebar marker,
  important stars and the follow-ups band.
- **Type:** Manrope (`font-display`, OFL) for h1–h3, the brand and key figures; Inter for everything else.
  Panel titles are small uppercase.
- **Shape:** squarer corners (3 / 5 / 6 / 8px) and flat cards (`shadow-card` is a 1px line).

## Design system

All tokens are in `src/styles/index.css`. The default Tailwind palette and type scale are cleared, so only ODMS tokens can be used.

- **Type (Inter):** `text-display` 28 · `text-title-lg` 24 · `text-title` 20 · `text-heading` 15 · `text-body` 14 · `text-secondary` 13 · `text-caption` 12 · `text-label` 11 (uppercase)
- **Color:** `canvas` / `surface` / `surface-raised` / `subtle` / `muted`, `border` / `border-strong`,
  `ink` / `ink-secondary` / `ink-muted` / `ink-disabled`, `primary` (+ `-hover`, `-active`, `-subtle`, `-ink`),
  and `success`, `warning`, `danger` and `info`, each with `-dot` and `-subtle` variants
- **Spacing:** Tailwind's 4px scale; layout sizes `sidebar` 248, `sidebar-rail` 64, `topbar` 56, max content width 1600
- **Paper:** `paper`, `paper-ink`, `paper-muted`, `paper-line`, `paper-head`, `paper-sign`, `paper-alert` for printed
  forms (booklet, PDF preview). They stay the same in dark mode, like a printout.
- **Radius:** 3 / 5 / 6 / 8. **Elevation:** `shadow-xs`, `shadow-sm`, `shadow-overlay` (overlays only)
- **Motion:** 150–220ms using `--ease-standard`; turned off when the user prefers reduced motion
