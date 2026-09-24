# ODMS · Chennai Metro Rail — agent guide

Instructions for AI coding agents (Cursor, Google Antigravity, Claude Code, Codex, Copilot, …) working in this repo.
This file is the single source of truth: `CLAUDE.md` imports it, and Cursor and Antigravity read it directly.
Keep it current when conventions change.

## What this is

ODMS is the operations app for **Chennai Metro Rail (CMRL) station staff**, mainly Station Controllers. It is a new
build, not a reskin of the old system. The old system (`cmrl-odms.com`) is only a reference for features and the
official paper formats. Never submit, log or change anything there.

The shell (sidebar, topbar, search, notifications, theme) is done. Business modules come one at a time (about 15
planned). Built so far: **Station Diary** and **Registers**. The backend doesn't exist yet: all data is in-memory mock
data shaped like the future API.

## Commands

All frontend work happens in `frontend/`.

```bash
cd frontend
npm install
npm run dev            # Vite dev server (port 3002 in vite.config.ts)
npm run build          # tsc -b && vite build — must pass
npm run lint           # oxlint — no new warnings
npm run format         # Prettier + Tailwind class sorting
```

Before calling any change done: `npx tsc -b`, `npm run lint` and `npm run build` pass, and you have looked at the UI in
the **light theme** (it is the primary theme; dark must not regress).

## Stack

React 19 · TypeScript (strict, `noUnusedLocals`) · Vite · Tailwind CSS v4 (tokens in `src/styles/index.css`) ·
React Router 7 (data router, lazy routes) · lucide-react icons · `@react-pdf/renderer` for PDFs · Inter
(`@fontsource-variable/inter` for the UI, `@fontsource/inter` WOFF files for PDFs).

**Dependencies must be free and open source** (MIT, ISC, Apache-2.0, BSD, OFL, …). No paid, trial or
account-gated packages or services. Don't copy font or binary files into `src/`; import them from npm packages. Add a
dependency only when it clearly earns its place, and lazy-load heavy ones.

## Layout

```
frontend/src/
├── app/            App + router.tsx (routes carry breadcrumb/title in `handle`; module pages are lazy)
├── components/
│   ├── layout/     AppShell, Sidebar, Topbar, PageHeader, MobileDrawer, …
│   ├── navigation/ Breadcrumb, NavigationGroup
│   ├── search/     GlobalSearch
│   └── ui/         Button, IconButton, Badge, Card, Field (Input/Select/Textarea/Checkbox/Label), Modal, Dialog,
│                   SegmentedControl, Pagination, Tooltip, Kbd, EmptyState, StatusDot, Avatar
├── modules/        one folder per business module
│   ├── station-diary/  pages/ components/ data/ pdf/ types.ts constants.ts utils.ts richText.ts hooks.ts
│   └── registers/      pages/ components/ data/ definitions.ts types.ts
├── constants/      navigation.ts (sidebar + search), mock.ts (session), search.ts
├── context/        SessionContext (user/station/shift), ShellContext, ThemeContext
├── hooks/ pages/ types/ utils/
└── styles/index.css   design tokens (the only source of colours, type sizes, radii, shadows)
```

## Conventions

- **Class names:** plain strings and template literals. **No `cn`/`clsx`/class-merging helper.** Put long or shared
  base classes in named constants (`BASE`, `CELL`, `CHIP`), variants in `Record` maps, conditions as ternaries.
  Prettier sorts classes.
- **Tokens only:** colours from `index.css` (`bg-surface`, `text-ink-muted`, `bg-primary-subtle`, `text-danger`, …).
  The default Tailwind palette and type scale are **cleared**, so `text-sm` and `gray-500` don't exist. Use `text-body`,
  `text-secondary`, `text-caption`, `text-label`, `text-heading`, `text-title`. Printed forms use the `paper-*` tokens,
  which stay white in dark mode.
- **Sizes in rem**, never px, in components (the root font size is fluid). Borders and focus rings may stay px.
- **Light theme first:** design and verify in light, then check dark. Navy sidebar uses the `.on-dark` token scope.
- **Accessibility:** real labels on every control, `aria-*` on custom widgets, visible focus, no information by
  colour alone.
- **Pages** start with `<PageHeader>`. Reuse `components/ui` before writing new primitives; add new shared primitives
  there when a second module needs them.
- **Copy:** plain, specific English from the station staff's point of view. Buttons say what they do ("Export PDF",
  "Sign & hand over"). Errors say how to fix the problem.
- Match the surrounding code's comment density and naming. Re-read a file before editing: people edit between
  sessions, sometimes with other tools. Respect their changes instead of reverting them.

## Architecture rules

- **Modules** live in `src/modules/<name>/` and are loaded lazily:
  `lazy: page(() => import('@/modules/<name>/pages/SomePage'))` in `app/router.tsx`.
- **Data** goes through the module's store in `data/*Store.ts`: hooks for reads (`useSyncExternalStore`), plain
  functions for writes. Components never hold module data themselves. When the backend arrives, only the store
  changes.
- **Breadcrumbs:** `handle: { crumb }`. A crumb can be a function of route params, e.g. to show a register's name.
- **Heavy code is lazy:** the PDF renderer and its fonts load only when someone exports. Keep the main bundle lean.
- **Tables:** paginate (and later filter on the server). Never render unbounded lists.

## Domain rules (agreed with the product owner — do not change without asking)

- **Always show date and time** for anything logged: entries, sign-in/out, handover, due dates, history. Screen:
  `24/09/2026 14:58`; forms/PDF: `24/09/2026 14:58:10`. Use `formatStamp` / `formatStampSeconds` in
  `modules/station-diary/utils.ts`. Shift C runs past midnight, so a bare time is ambiguous.
- **Shifts:** A 06:00–14:00, G 09:00–17:30 (general), B 14:00–22:00, C 22:00–06:00. Display order A, G, B, C.
- **Station Diary**
  - One diary per station + date + shift. ODMS itself logs task updates, closed follow-ups and handover
    (`system: true`, shown as "Recorded by ODMS"); those can't be changed.
  - Each entry has **Edit**, **Follow-up** and **Delete**, only on the controller's **own entries on the open
    shift**. Edits keep the original logged time, show "Edited <date time>" (also on the form/PDF) and keep the
    earlier wording in `revisions`. Deletes ask for confirmation in-page and move the entry to `deletedEntries`
    (hidden from diary, booklet and PDF, kept for audit). Follow-up adds the entry to the shift's Follow-ups,
    which carry to the next shift at handover. Handed-over shifts are locked.
  - **Follow-ups live in the diary log itself** (no separate side panel): open follow-ups are pinned in an amber
    "Follow-ups · N open" band above the timeline, with **Close follow-up** on the row itself. Follow-ups carried from
    the previous shift appear in the same band. Closing one logs "Follow-up closed: …" and returns the entry to its
    normal place.
  - **No categories** on diary entries or in filters. Filters are **All** and **★ Important** only.
  - **No floating cash** anywhere in the diary.
  - **Hot keys** are saved, reusable messages for a station. Clicking one **inserts its message into the editor**,
    selecting the first `__` blank. Users create them with **Save as hot key** (from the typed message) or
    **Add hot key** (a dialog with name + message). **No keyboard shortcuts** for hot keys, and hot keys never log
    an entry by themselves.
  - Editor: light markup (`**bold**`, `_italic_`, `- ` / `1. ` lists) parsed by `richText.ts`. Never inject HTML.
    Attach images, generate PN numbers, mark ★ important, and log with Ctrl/⌘+Enter. Unsent text is kept as a draft
    per shift.
  - **Submit & hand over** confirms the summary and the incoming controller, then locks the shift. Past shifts are
    read-only.
  - **Shift Summary** has a Table / **Booklet view** switch. The booklet shows each shift on the official form.
- **Official form & PDF** (`CMRL/OPER/SO/F-01`, Rev 00, Date 2022-09-01):
  - Layout: CMRL logo + "CHENNAI METRO RAIL LIMITED / STATION DIARY / station" header; Date, Shift, Emp Name,
    Emp ID, Sign-in, Sign-out; a **Date & time | Remarks** table; tasks; **Shift handover details** with signatures;
    footer with the reference (`CEN01/SD/2026-09-24/B`), "Generated from ODMS by … on …" and "Page x of y".
  - Watermark: the **CMRL logo**, faint and centred on every page. A shift not yet handed over shows a small red
    **"DRAFT · not handed over"** label, not a text watermark.
  - `components/DiaryFormSheet.tsx` (screen) and `pdf/DiaryPdfDocument.tsx` (PDF) draw the **same form**. Change
    both together.
  - The PDF is a real file from `@react-pdf/renderer`, not `window.print()`. `pdf/downloadDiaryPdf.tsx` is the one
    seam to swap for server-side generation later. ★ is drawn as a vector because Inter's Latin WOFF files lack it;
    ₹ comes from the Latin Extended file via font fallback.
- **Registers:** each register is **configuration** in `modules/registers/definitions.ts` (fields, reference code,
  retention). The table, form and record panel are generated from it. Records are never deleted. Status goes
  Open → In progress → Pending verification → Closed, closing needs a remark, and every change goes into history.
  "Create register entry" on a diary entry opens the register picker, pre-fills the form and links both ways.

## Adding a module (checklist)

1. Create `src/modules/<name>/` with `types.ts`, `data/<name>Store.ts` (mock, API-shaped), `pages/`, `components/`.
2. Add lazy routes in `app/router.tsx` with `handle.crumb`, then set `to` and `status: 'available'` for its entry in
   `constants/navigation.ts` (this also adds it to global search).
3. Build pages from `PageHeader`, `Card`, `Field`, `Modal`, `Pagination`, `Badge`; follow the domain rules above,
   especially date + time.
4. Run `tsc -b`, lint and build, then check light and dark themes and a narrow (mobile) width.
5. Update `frontend/README.md` (Modules section) and this file if you introduced a new rule or convention.

## When unsure

Requirements come from station operations and are easy to misread (the meaning of "hot keys" was misunderstood once).
If a request is ambiguous, ask a short question or confirm against the reference system **before** building. Don't
guess and ship.
