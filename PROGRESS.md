# Progress

## Standing note: pre-commit hygiene

Before every `git add`/commit, verify the staged set does not include
`node_modules`, `dist`, `dev-dist`, any `.env`/`.env.*` file, `.DS_Store`, or
other OS/editor junk. `git status --short` after staging is the quick check.
Never commit secrets or generated build output — `.gitignore` covers all of
the above (see the 2026-07-30 hygiene audit below), but it only prevents
*accidental* `git add .`; anything added by explicit path still bypasses it.

## Phase 0 — Scaffold

### What was built

- Vite + React 18 + TypeScript project, scaffolded via `create-vite` and
  merged into the repo root (name pinned to `compass`, React pinned to
  `^18.3.1` — the scaffold defaults to React 19).
- Tailwind CSS v3, wired to consume `src/styles/tokens.css` CSS variables
  via `tailwind.config.js` theme extension (`bg-surface`, `text-muted`,
  `text-accent`, `bg-accent`, `text-good`, `border-border`, `max-w-content`,
  `font-display`/`font-body`/`font-mono`, spacing scale, radii).
- Design tokens (`src/styles/tokens.css`): dark-only palette (ink/surface/
  border/text/muted/amber accent/desaturated green), spacing rhythm, 720px
  content max-width, `prefers-reduced-motion` global override.
- Fonts self-hosted via Fontsource (`@fontsource/space-grotesk` 600,
  `@fontsource/instrument-sans` 400/500, `@fontsource/jetbrains-mono` 400) —
  no Google Fonts CDN, works offline.
- Types (`src/types/models.ts`): all interfaces from the spec, exported
  verbatim.
- App shell: React Router v6 routes for `/today`, `/inbox`, `/week`,
  `/goals`, `/journal`, `/insights`, each a placeholder page; `/` redirects
  to `/today`; unknown paths redirect to `/today`. Left rail nav on
  desktop (`md:` breakpoint, 768px), bottom tab bar on mobile
  (`src/components/LeftRail.tsx`, `BottomTabBar.tsx`, `navConfig.ts`).
- Global capture: Zustand store (`src/store/captureStore.ts`) holding a
  temporary in-memory array of captured items. Amber FAB
  (`CaptureButton.tsx`) bottom-right on mobile, `c` keyboard shortcut on
  desktop (ignored while typing in another field or while the dialog is
  already open). Dialog (`CaptureDialog.tsx`) is a single text input +
  Save/Cancel; a window-level keydown listener (not just the input's
  `onKeyDown`) handles Escape (close) and Enter (save), so it isn't
  sensitive to focus timing.
- PWA: `vite-plugin-pwa` with a manifest (name "Compass", theme color
  `#0E1116`, generated 192/512 PNG icons + source SVG) and Workbox
  `generateSW` precaching the built app shell (confirmed 22 entries /
  ~309 KiB precached on `npm run build`).

### Key decisions

- **Tailwind v3, not v4.** The scaffold pulled v4 by default; v4's
  CSS-first `@theme` config is a bigger departure than this phase needs.
  v3's `tailwind.config.js` theme-extend maps cleanly onto CSS custom
  properties defined once in `tokens.css`.
- **React Router v6, not v7.** Installed as specified; opted into the
  `v7_startTransition` / `v7_relativeSplatPath` future flags in
  `BrowserRouter` to silence the (harmless) deprecation warnings without
  changing behavior.
- **Capture store is intentionally throwaway.** Real persistence
  (Dexie-backed `CaptureItem` records) is explicitly out of scope until
  Phase 1; the Zustand array exists only so the dialog has somewhere to
  push text for now.
- **Escape/Enter handled via a window listener, not the input's
  `onKeyDown`.** Relying solely on the input's own key handler is fragile
  if focus hasn't landed yet (e.g. right after the dialog mounts). A
  window-level listener scoped to `isOpen` is robust regardless of focus
  state.

### Known issues / follow-ups

- No real persistence yet — capture items vanish on reload (by design,
  Phase 1 work).
- No automatic Fontsource weight for Instrument Sans other than 400/500,
  and no italic — add if a page needs it later.
- `npm run test` is wired to Vitest but there are no tests yet (nothing to
  test in a placeholder-only scaffold).
- Manifest icons are simple generated PNGs (compass motif), not a
  designed mark — fine as placeholders, revisit before shipping.

### Suggestions (not built — out of scope for this phase)

- Add an ErrorBoundary around the route tree / capture dialog.
- Add a11y live-region announcement when a capture item saves.

## Phase 0.5 — iOS-feel polish + light/dark theme system

UI-only pass. No new routes, features, or data logic.

### What was built

- **Semantic theme tokens** (`src/styles/tokens.css`): every color is now a
  semantic variable (`--bg`, `--surface`, `--surface-elevated`,
  `--border-hairline`, `--text`, `--text-muted`, `--text-faint`, `--accent`,
  `--accent-on`, `--accent-wash`, `--accent-ring`, `--good`, `--overlay`,
  `--tabbar-bg`) defined twice — once under `:root, :root[data-theme='dark']`
  and once under `:root[data-theme='light']`. No component references a raw
  hex value. Also added motion (`--ease-ios`), shadow (`--shadow-card`,
  `--shadow-fab`, `--shadow-sheet`), and an expanded radius scale
  (`--radius-sm/md/lg/xl/full`).
- **Theme store** (`src/store/themeStore.ts`): Zustand store holding
  `preference: 'system' | 'light' | 'dark'`, persisted to `localStorage`
  (`compass-theme`), resolves to `light`/`dark` and applies `data-theme` on
  `<html>` plus updates the `theme-color` meta tag so the mobile status bar
  matches. Listens to the `prefers-color-scheme` media query and re-resolves
  live when `preference === 'system'`.
- **No-flash boot**: an inline synchronous script in `index.html` (before any
  other head tag) reads the stored preference and system preference and sets
  `data-theme` before first paint, so there's no flash of the wrong theme.
- **ThemeToggle** (`src/components/ThemeToggle.tsx`): a small unobtrusive
  3-way segmented control (System/Light/Dark icons) placed in each page's
  header — temporary, until a real settings screen exists.
- **iOS type scale** (`tailwind.config.js`): `large-title` (34px/700,
  tight tracking), `title` (22px/600), `headline` (17px/600), `body`
  (17px), `subhead` (15px), `caption` (13px), `caption-2` (11px, tab bar
  labels).
- **Inset-grouped cards**: `EmptyState` renders each placeholder page's
  empty message inside a `rounded-lg` (16px) `bg-surface` card with
  `shadow-card` — soft elevation instead of a hard border.
- **iOS-native nav**: `BottomTabBar` is a frosted (`backdrop-blur-xl`),
  translucent (`bg-tabbar`), safe-area-aware
  (`pb-[env(safe-area-inset-bottom)]`) tab bar with icon-over-label per tab,
  active tab in accent. `LeftRail` softened — hairline instead of a hard
  border, accent-wash pill for the active item, icons added for parity.
- **Capture sheet**: `CaptureDialog` now presents as a true iOS sheet on
  mobile — slides up from the bottom, rounded top corners, grab handle,
  dimmed backdrop — and as a centered fade/scale modal on desktop (`md:`).
  Built with a `mounted`/`entered` state pair (not a library) so it can
  animate on both mount *and* unmount; exit takes 220ms before actually
  unmounting.
- **Motion**: `.ios-press` utility class (`src/styles/tokens.css`) gives
  buttons/rows/nav items a 0.97 scale + opacity dip on `:active` using the
  `--ease-ios` cubic-bezier. Centralized in plain CSS (not Tailwind
  `active:` variants) so the `prefers-reduced-motion` override reliably
  wins regardless of utility ordering — it forces `transform: none` on
  `.ios-press:active` and `.ios-sheet` under reduced motion, not just a
  faster transition.
- **Icons** (`src/components/icons.tsx`): minimal inline stroke SVGs
  (24px, `currentColor`, no icon library dependency) for all six nav
  items and the three theme states, plus a plus-icon for the FAB.
- **Tap targets**: all interactive controls (nav links, tab bar items,
  theme toggle segments, dialog buttons) are ≥44px (Tailwind's `11` =
  2.75rem = 44px).

### Key decisions

- **CSS-variable colors, not Tailwind's `dark:` class strategy.** Every
  component already only ever references semantic Tailwind color
  utilities (`bg-surface`, `text-muted`, etc.) that resolve through CSS
  custom properties gated on `[data-theme]`. This means zero `dark:`
  variants needed anywhere — the same class works in both themes. Removed
  `darkMode: 'class'` from `tailwind.config.js` since it's unused.
- **Dedicated `--accent-wash`/`--accent-ring` tokens instead of Tailwind
  opacity modifiers** (`bg-accent/10`). Tailwind v3's color-opacity
  modifier syntax needs the color defined as an RGB triplet fed through
  `rgb(var(--x) / <alpha-value>)`; our tokens are plain hex/rgba strings,
  so `/10` wouldn't reliably resolve. Explicit translucent tokens are
  simpler and correct in both themes.
- **No animation library.** The capture sheet's enter/exit transitions are
  done with a `mounted`/`entered` boolean pair and plain Tailwind
  transition utilities, not Framer Motion — this is a UI-only polish
  pass, so no new runtime dependency.
- **Reduced-motion handled via a dedicated CSS class, not Tailwind's
  `motion-reduce:` variant.** Combining `active:scale-97` with
  `motion-reduce:active:scale-100` risks losing to Tailwind's utility
  source-order rules. Centralizing press-state and sheet-transform
  overrides in tokens.css under one `@media (prefers-reduced-motion:
  reduce)` block guarantees the override wins.
- **Empty-state copy is static per page**, not computed — kept simple to
  avoid introducing any data logic ahead of Phase 1.

### Known issues / follow-ups

- `ThemeToggle` is intentionally temporary UI (per phase prompt) — replace
  with a real settings screen entry later.
- No automated tests for theme persistence/system-preference syncing;
  verified manually in-browser (localStorage persistence across
  navigation, live system-preference change via `matchMedia`).
- Accent hex differs between themes (`#e8a33d` dark / `#b4741f` light) by
  design — the darker light-mode amber is needed for text contrast on a
  white/near-white surface; flagged here in case it's ever compared
  pixel-for-pixel against the original single-hex spec.

### Suggestions (not built — out of scope for this phase)

- Add an ErrorBoundary around the route tree / capture dialog.
- Add a11y live-region announcement when a capture item saves.
- Consider adding `prefers-contrast: more` support once real content
  exists to test against.

## Repo hygiene audit — 2026-07-30

Ran a full audit (`git ls-files` cross-checked against `node_modules/`,
`dist/`, `.env*`, `.DS_Store` patterns) to look for anything tracked that
shouldn't be. Result: **nothing was actually tracked** — `node_modules` and
`dist` exist on disk but were already correctly excluded by the original
`.gitignore`, and no `.env` or `.DS_Store` file has ever existed in this
repo. No secrets were ever committed or pushed; nothing to rotate.

Still hardened `.gitignore` per request, adding: `build/`, `coverage/`,
explicit `.env`/`.env.*` (with a `!.env.example` exception, standard
practice), and the `vite-plugin-pwa` generated artifacts (`dev-dist/`,
`sw.js`, `workbox-*.js`, `registerSW.js`) that only exist post-build and
should never be tracked from source. No files were untracked since none
matched.

## Phase 0.6 — iOS refinement pass

UI-only. Fixes specific "not-native" tells left over from Phase 0.5.

### What was built

- **Empty states no longer a card.** `EmptyState` dropped the
  `bg-surface`/`shadow-card`/padded-box wrapper entirely — it's now just a
  small icon circle + headline + muted subtitle, centered, capped at
  `max-w-[15rem]`, sitting with `mt-10`/`sm:mt-14` under the header. Reads
  as a compact native empty-state group instead of a web "hero card."
- **Radii softened**: `--radius-lg` (grouped/card radius) bumped
  16px → 18px per spec; `--radius-md` (12px, buttons/inputs) and the FAB's
  `rounded-full` were already correct and untouched.
- **ThemeToggle quieted**: segments shrunk 44px → 32px, icons 18px → 14px,
  padding tightened, dropped `shadow-card`, and the active-state color
  changed from `text-accent` to a neutral `text-text-muted` on a recessed
  `bg-bg` — it no longer pulls the eye next to the page title. (This is a
  deliberate, called-out exception to the ≥44px tap-target rule from Phase
  0.5 — it's explicitly temporary scaffolding pending a real Settings
  screen, not a permanent control.)
- **Large-title spacing**: `PageHeader` switched from `items-start` to
  `items-center` so the toggle sits on the title's baseline instead of
  top-aligned; header bottom padding tightened (`pb-6` → `pb-2`) since
  `EmptyState`'s own top margin now owns that gap. `AppShell`'s top padding
  increased (`pt-6`/`md:pt-9` → `pt-8`/`md:pt-11`) for more breathing room
  above the title.

### Key decisions

- **ThemeToggle's 32px targets intentionally violate the 44px tap-target
  guideline.** The phase prompt explicitly asked to shrink it because it's
  temporary and shouldn't compete visually with the large title; noting
  the tradeoff here so it isn't mistaken for an oversight once a permanent
  Settings entry replaces it.
- **`max-w-[15rem]` on `EmptyState`** (not a token) — this is a one-off
  layout constraint specific to keeping empty-state text from growing too
  wide, not a reusable design value, so it stays as an arbitrary Tailwind
  value rather than a new token.

### Known issues / follow-ups

- None new. Carries forward the Phase 0.5 follow-ups list above.

## Phase 1 — Local data layer (Dexie)

Data only. No new screens/visual features except wiring the existing
capture dialog to persist for real.

### What was built

- **`src/db/db.ts`**: `CompassDB` (Dexie, database name `compass`), version 1,
  one table per `src/types/models.ts` interface (`captures`, `habits`,
  `habitLogs`, `tasks`, `goals`, `milestones`, `weeklyPriorities`,
  `journalEntries`, `reviews`, `syncQueue`), indexed per the requested query
  patterns (`habitLogs`: `[habitId+date]` + `date`; `tasks`: `date`,
  `weeklyPriorityId`, `goalId`, `status`; `milestones`: `goalId`, `month`;
  `weeklyPriorities`: `weekOf`; `journalEntries`: `date`; `reviews`:
  `[type+periodKey]`). `captures.processed` and `tasks.isMIT` are
  deliberately *not* indexed — see "Boolean fields are never Dexie indexes"
  in [DECISIONS.md](DECISIONS.md).
- **`src/db/rules.ts`**: `canActivateHabit()`, `canAddMIT(date)`,
  `canAddWeeklyPriority(weekOf)`, and `RuleViolationError` (typed, carries a
  `code`). Enforces the product-law limits from CLAUDE.md rule 3.
- **`src/db/repo/*.ts`** — the only files besides `db.ts`/`rules.ts` that
  touch Dexie directly: `captures.ts`, `habits.ts`, `tasks.ts`, `goals.ts`,
  `milestones.ts`, `weeklyPriorities.ts`, `journal.ts`, `reviews.ts`. Every
  mutation sets `updatedAt`; every read filters out `deletedAt` records;
  `create`/soft-delete/update per the phase spec, plus:
  - `habits.logHabit(habitId, date, status)` — toggle: same status again
    removes the log (soft-delete), different status switches it, no log
    creates one. Returns the resulting log or `null` if removed.
  - `habits.weeklyHitRate(habitId, weekOf)` — uses the `[habitId+date]`
    compound index via `.anyOf()` over the week's 7 dates.
  - `goals.progress(goalId)` — % of that goal's non-deleted milestones with
    `status === 'done'`.
  - `tasks.update()` re-checks the MIT limit only when a task is newly
    becoming an MIT for a given date (not on every unrelated field edit).
- **`src/lib/dates.ts`**: `todayISO`, `nowISO`, `weekOf` (Monday-start, see
  DECISIONS.md), `monthKey`, `addDays`, `formatDay`. All date-only values
  are parsed via local `Date` components (`parseDateISO`), never
  `new Date(isoString)` directly, to avoid UTC-offset day-shift bugs.
- **Capture dialog now persists for real**: `captureStore.ts` is down to
  just `isOpen`/`open`/`close`; `CaptureDialog.tsx` calls
  `captures.create(text)` directly and closes optimistically (fire-and-
  forget with a `.catch` that logs, per CLAUDE.md's "no spinners for local
  operations" — Dexie writes are fast enough that waiting isn't
  necessary). No other visual change.
- **`src/db/seed.ts`** + hidden **`/dev`** route (`src/pages/DevPage.tsx`,
  not in `navConfig`): `seedDatabase()` is idempotent (skips if any habit
  already exists) and creates 3 active habits with 3 weeks of varied
  done/skipped/empty logs, 2 goals with 2 milestones each, 5 tasks this
  week (2 MIT today), and 4 journal entries with mood/energy.
  `wipeAllData()` clears every table in one transaction; the Seed/Wipe
  buttons on `/dev` are plain buttons, Wipe gated by `window.confirm`.
- **Tests** (`src/db/__tests__/`, Vitest + `fake-indexeddb`): habit toggle
  (empty→done→removed, done→skipped switch), max-5 active habits, max-3
  MITs/day, `weeklyHitRate` math, capture create→getUnprocessed→
  markProcessed flow, and soft-delete exclusion. 8 tests, all passing.

### Key decisions

- **Boolean fields are not Dexie indexes.** IndexedDB has no valid boolean
  key type — an index on `processed`/`isMIT` would silently never match any
  record. Filtered client-side after an indexed lookup on a sibling field
  instead. Full writeup in DECISIONS.md; flagging here since the phase
  prompt explicitly asked for `captures processed` and `tasks isMIT` as
  indexes and this deviates from a literal reading of that ask.
- **`vite.config.ts`'s `defineConfig` now imports from `vitest/config`**
  (not `vite`) so the same config file can carry a `test` block with proper
  types, instead of a separate `vitest.config.ts`. Test environment is
  `node` (not `jsdom`) since these are pure data-layer tests — no DOM
  needed, `fake-indexeddb/auto` (imported in `src/test/setup.ts`) is the
  only polyfill required.
- **Capture dialog closes optimistically, not after awaiting the write.**
  Matches CLAUDE.md's speed/no-spinner rule; the write failure path is
  `console.error`, not a user-facing error — acceptable for a personal
  local-first app where writes practically never fail.
- **`update()` on tasks/habits takes a `Partial<Pick<...>>` of just the
  mutable fields**, not the full record — keeps callers from
  accidentally overwriting `id`/`createdAt`/etc., and keeps the MIT
  re-check in `tasks.update()` scoped to only when MIT-ness or its date
  actually changes (not every edit).

### Known issues / follow-ups

- No UI reads any of this data yet (Today/Inbox/Week/etc. are still empty
  placeholders) — that's the next phase's job; this phase only had to prove
  the data layer works, which the test suite plus a manual seed/capture/
  wipe pass in a real browser (not just `fake-indexeddb`) confirmed.
- `RuleViolationError` is thrown but nothing catches it yet outside tests —
  UI-level error messaging (e.g. "You already have 5 active habits") is
  future work once habit-creation UI exists.
- `tasks.getForWeek` / `weeklyPriorities.getForWeek` both take a Monday
  `weekOf` string directly rather than accepting an arbitrary date and
  resolving it internally — callers are expected to pass `weekOf(date)`
  themselves, consistent with how `WeeklyPriority.weekOf` is stored.

## Phase 2A — Today screen

The first real screen: daily header, MITs, habits, and an evening review
flow. No other pages touched except extracting a shared sheet component
(used only by the existing capture dialog and the new review dialog).

### What was built

- **Schema v2** (`src/db/db.ts`): `Task` gained `firstMove?: string` and
  `estimateMin?: number` (`src/types/models.ts`) — no UI yet, Phase 2B's
  job. Neither is indexed, so `version(2).stores({})` bumps the version
  number without redeclaring any store; existing data carries forward
  untouched. Documented in `db.ts` and here as the migration precedent.
- **Repo additions**: `habits.getWeekLogs(habitId, weekOf)` (one entry per
  day of the week via the `[habitId+date]` compound index) and
  `reviews.getCompletedDailyPeriodKeys(start, end)` (which days in a range
  have a completed daily review, for the year grain).
- **`src/lib/dates.ts`**: `formatHeaderDate` ("THU · 31 JUL"). **`src/lib/
  useNow.ts`**: a 60s-ticking clock hook so "today," the greeting, and the
  18:00 evening-review gate all roll over live without a page refresh.
- **`src/lib/reviewResume.ts`**: `resumeStepFor(review)` — a small pure
  function (score → step 1, win → step 2, lesson → step 3, else step 4)
  extracted out of the dialog specifically so the resume logic is unit
  testable without rendering React.
- **`src/components/Sheet.tsx`**: extracted the mount/enter/exit iOS-sheet
  mechanics out of `CaptureDialog` into a shared component (props:
  `isOpen`, `onClose`, `ariaLabel`, `children`). `CaptureDialog` now just
  supplies its input + buttons; behavior unchanged, verified in-browser.
  Used by the new `EveningReviewDialog` too.
- **Today screen** (`src/pages/TodayPage.tsx` + `src/components/today/*`):
  - `TodayHeader` + `YearGrain`: mono date, greeting, and a compact
    Jan-1–Dec-31 dot grid (GitHub-contribution-graph layout via CSS grid
    `grid-auto-flow: column` with leading blank spacers so the flat date
    array lands on the right weekday row). Completed-review days get a
    quiet `bg-good` fill; today gets an amber outline ring; tapping
    navigates to `/insights`.
  - `TodayFocus`: up to 3 MIT rows (amber-fill circular check, 250ms
    transition, goal-link glyph when `goalId` is set), an inline add-focus
    input whose placeholder itself carries the empty-state invitation
    ("What matters most today?" / "Add another focus"), replaced by "Three
    is enough for today" at the cap. Collapsed-by-default "Other tasks
    today" disclosure below.
  - `TodayHabits`: each active habit as a two-line row (name + hit-rate
    on one line, cue below, then a full-width 7-cell Mon–Sun strip with
    single-letter mono day labels). Only today's cell is a `<button>`
    (pointerdown/up timing for long-press → skipped, `onContextMenu` for
    right-click → skipped, tap → done, both toggle back to empty on
    repeat). Quiet green ✓ once `done >= target`. Inline add-habit form
    (name/cue/target) below the list, replaced by "Five is plenty for
    now" at the 5-habit cap.
  - `EveningReviewCard` + `EveningReviewDialog`: card only renders when
    `now.getHours() >= 18` and today's daily review isn't completed
    (reactive via `useLiveQuery`). Dialog is 4 steps (score 1–5 dots →
    win → lesson → tomorrow's-focus picker/creator) in one `Sheet`,
    autosaving each answer (`reviews.upsert('daily', today, …)`) as you
    go, resuming at `resumeStepFor(review)` when reopened. Finishing sets
    `completedAt`, shows a ~700ms amber checkmark ("Day closed."), then
    closes — after which the card disappears and the year grain fills in,
    both live.
- **New tokens**: `--skip-fill` (neutral gray fill for "skipped" habit
  cells — explicitly not red, per spec) in both themes, mapped to Tailwind
  as `bg-skip`. New icons: `IconCheck`, `IconChevronRight`,
  `IconChevronDown`.
- **Tests**: `src/db/__tests__/reviews.test.ts` — upsert merges `score`/
  `answers`/`completedAt` across separate calls without clobbering earlier
  fields (this only works because callers always pass the *full* merged
  `answers` object; `upsert`'s Dexie `.update()` replaces that field
  wholesale, it doesn't deep-merge), plus all 5 `resumeStepFor` branches.

### Key decisions

- **`reviews.upsert`'s `answers` patch replaces, not merges.** Since
  `Review.answers` is `Record<string, string>`, `EveningReviewDialog`
  keeps `win`/`lesson` in local state and always sends the complete
  merged object on every save — documented at the call sites and covered
  by the new test, since it's an easy place for a future caller to
  accidentally clobber a sibling answer.
- **Resume-hydration effect depends only on `[isOpen]`, not `[isOpen,
  review]`.** The dialog's own autosaves re-fire the `review` live query
  while it's open; syncing local state from that on every emission would
  overwrite in-progress typing with the (momentarily stale) saved value.
  Only re-hydrate on the open transition.
- **`today`/`tomorrow` are derived from the live `useNow()` clock**, not a
  static `todayISO()` call, so the whole page's notion of "today" — MITs,
  habits, the header date, the evening gate — rolls over automatically at
  midnight if the app is left open, without requiring a manual refresh.
- **Habit row is two lines, not one**, after an in-browser check caught a
  real horizontal-overflow bug: name + week-strip + hit-rate all on one
  flex row doesn't fit at 393px once a habit has a real name. Fixed to
  name+hit-rate on line 1, cue on line 2, full-width `justify-between`
  strip on line 3 — verified `scrollWidth === clientWidth` afterward.
- **Long-press/right-click skip uses raw pointer events** (`onPointerDown`
  /`onPointerUp`/`onPointerLeave` + a 500ms timer, plus `onContextMenu`
  with `preventDefault`), not a gesture library — this is the only
  interaction in the app that needs press-duration detection, so a small
  local timer is simpler than a new dependency.

### Known issues / follow-ups

- `firstMove`/`estimateMin` have no UI yet (by design — Phase 2B).
- No settings screen exists yet for editing/pausing/archiving a habit
  once created — only creation is exposed on Today.
- The "Other tasks today" and tomorrow's-focus "other tasks" lists don't
  paginate or sort explicitly; fine at the data volumes a personal planner
  produces, revisit if that changes.
- Manual browser verification hit two unrelated environment quirks worth
  recording so they're not mistaken for app bugs later: (1) the automated
  pointer-click tool intermittently failed to deliver clicks to specific
  buttons in one browser-pane session (confirmed via direct DOM
  `.click()` + IndexedDB read that the underlying app logic was correct
  every time); (2) the same session rendered the desktop viewport's
  screenshot at a different pixel ratio than the real viewport, making
  the page look tiny/offset in screenshots despite `scrollWidth ===
  clientWidth` confirming no actual layout bug. Neither reflects a
  problem in the app.

## Phase 2A.1 — Year grain and habit-cell legibility fixes

UI-only fixes to `/today`, found at iPhone width. No new features or data
changes beyond one repo query shape change (still read-only).

### What was built

- **Year grain switched from a 53-column weekly layout to 12 month-rows**
  (`YearGrain.tsx`). The weekly layout forced 3px cells to fit the content
  width, which read as a smudge; a 12-row month layout (each row is that
  month's days, 28–31 cells) affords 9px cells at the same width and is
  visibly a grid. Moved to its own full-width row below the greeting in
  `TodayHeader.tsx` (doesn't fit beside the date/greeting at 393px, per
  the phase prompt's own fallback instruction).
- **Score-based ink-blue fill**: completed days are filled with a new
  `--ink` token (a calm blue, tuned separately per theme) at an opacity
  that scales with that day's review score (1 → 0.28 opacity, 5 → 1.0),
  instead of a flat `bg-good` fill. `reviews.getCompletedDailyPeriodKeys`
  (returned only dates) was replaced with `reviews.
  getCompletedDailyReviews` (returns `{periodKey, score}[]`) so the grain
  can read the score.
- **New `--grid-empty` token**: a visibly-gray (not near-transparent)
  fill for cells with no completed review, tuned per theme so the grid
  reads clearly on both dark and light backgrounds — this was the core of
  the "near-invisible smudge" complaint; `--border-hairline` (designed for
  1px separators) was too faint to double as a standalone cell fill.
- **Habit week-strip cells switched from filled circles with a letter
  inside to rounded squares** (`rounded-[6px]`) with the weekday letter
  moved to a small mono label below the square, per spec. Colors
  unchanged (amber done / `bg-skip` skipped / `bg-grid-empty` empty,
  bordered). Today's square gets the amber outline ring only when empty
  (unchanged logic, same conditional as before — just moved from the
  circle to the square and the ring no longer competes with a letter
  glyph inside the same shape).
- Row layout changed from `flex justify-between` to `grid grid-cols-7` so
  all 7 day-columns (square + label stacked) are equal width; the
  interactive "today" cell is still a real `<button>` with `min-h-11` so
  the tap target stays ≥44px even though the visible square is small
  (22px).

### Key decisions

- **Month-row grid over the week-column grid.** The phase prompt offered
  both layouts and asked to "pick whichever is clearer at 393px." Did the
  arithmetic first: 53 columns forces ~5px cells to fit 353px of content
  width; 12 rows of up to 31 columns affords ~9px cells in the same
  width. Bigger cells at the same footprint is a strictly better
  legibility trade, so month-rows won.
- **Intensity is computed opacity on one `--ink` token, not five discrete
  color tokens.** Consistent with how `--accent-wash`/`--accent-ring`
  already parameterize a base color by opacity rather than hand-picking
  multiple named shades — keeps the token surface small.
- **Empty-cell contrast is a new token, not a reuse of
  `--border-hairline`.** They serve different jobs (a 1px separator line
  vs. a standalone small filled cell needs more contrast to read as part
  of a grid) and conflating them was the root cause of the original bug.

### Known issues / follow-ups

- None new.

## Phase 2A.2 — Year grain rebuilt as a GitHub-contributions grid

UI-only rebuild of the year grain on `/today`. No data changes beyond the
score-read query added in 2A.1 (already in place, reused as-is).

### What was built

- **`YearGrain.tsx` fully rewritten** to the classic GitHub-contributions
  anatomy: weeks as columns (Monday-first — see DECISIONS.md), month
  labels along the top aligned to where each month's 1st falls, weekday
  labels (M / W / F only, to avoid clutter) down the left. Cells are
  small rounded squares (`rounded-[2px]`), filled with the `--ink` token
  at an opacity scaled by that day's review score, empty days use
  `--grid-empty`, today gets the amber outline ring — same fill logic as
  2A.1, just laid out GitHub-style instead of 12 stacked month-rows.
- **Responsive cell size via CSS custom properties, not a fixed
  constant.** The wrapper carries `[--cell:11px] [--gap:2px]
  md:[--cell:9px] md:[--gap:1.5px]` (Tailwind arbitrary-property syntax)
  and every cell/gap style reads `var(--cell)`/`var(--gap)`. Mobile keeps
  the readable ~11px cells the phase prompt asked for and scrolls;
  desktop needed a smaller ~9px to fit the full 53-column year inside the
  app's 720px content column without scrolling — measured the real
  available width in-browser (the scroll container's `clientWidth` at
  1280px viewport is 555px, not the ~656px a naive `720 - 2×32px padding`
  estimate suggested — the left rail alone accounts for most of the
  difference), then sized cells to fit that measured width with the gap
  ratio unchanged.
- **Horizontal scroll on mobile**: the day-grid (plus its month-label row,
  scrolling together so labels stay aligned to their columns) sits in an
  `overflow-x-auto` container styled `.scroll-thin` (new utility in
  `tokens.css`: `scrollbar-width: thin` + a quiet `::-webkit-scrollbar`
  thumb using `--border-hairline`, track transparent). A `useLayoutEffect`
  sets `scrollLeft = scrollWidth` once on mount so the most recent weeks
  (today) are in view immediately, before first paint — a direct
  `scrollLeft` assignment is already an instant jump, so there's no
  animated scroll to gate behind `prefers-reduced-motion` in the first
  place.
- **Cells are non-interactive** (`aria-hidden`, plain `<span>`s, no
  `onClick`) — no popover exists yet to show on tap, and the phase prompt
  said to leave cells inert rather than build one now.
- **Removed the whole-grid "tap to open /insights" button** that the
  previous (2A/2A.1) versions had. Wrapping a horizontally-scrollable,
  now much larger grid in a single full-area button risked the classic
  mobile bug where a drag-to-scroll gesture also fires a click on release.
  Since cells have no popover yet and the phase prompt frames this as "a
  calm glance, not a hero," dropping the navigation-on-tap for now was the
  right trade — revisit once a per-cell popover exists and can carry its
  own affordance instead.

### Key decisions

- **Monday-first, not GitHub's native Sunday-first.** Documented in
  DECISIONS.md — every other week-keyed concept in the app (`weekOf`,
  `WeeklyPriority.weekOf`, the habit week-strip) is Monday-first, and this
  is the one place a naive "just copy GitHub" instinct would have
  introduced a silent inconsistency.
- **Desktop cell size is smaller than mobile's, not the same ~11px
  everywhere.** The phase prompt's "~11px on desktop" was a starting
  point, not a hard requirement — it also explicitly required the full
  year to fit on desktop without scrolling, and 11px cells measurably
  don't fit inside this app's intentionally narrow 720px content column.
  Between the two, "fits without scrolling" is the functional requirement
  and won; ~9px is close enough to still read clearly.

### Known issues / follow-ups

- No popover exists for tapping a day cell yet (date · score · that day's
  "one win") — cells are inert for now, per the phase prompt. Building
  that is natural follow-up work once there's a reason to (e.g. from
  `/insights`).

## Phase 2B — Focus Mode, "I'm stuck," and first-move fields

The ADHD-support layer: helping start, not just knowing what to do. Today
screen only — no new routes, no data-layer changes beyond using the
`firstMove`/`estimateMin` fields the 2A schema bump already added.

### What was built

- **First move + estimate on tasks**: `tasks.create`/`tasks.update` now
  accept `firstMove`/`estimateMin`. A new shared `AddTaskInline` component
  (title input + two off-by-default reveal-on-tap fields, "+ first move"
  and "+ ~min") replaces the plain inline forms in both `TodayFocus`'s
  add-MIT input and the evening review's tomorrow-focus step, so the two
  places tasks get created share one implementation. `TaskRow` shows the
  first move as muted subtext under the title (when set) and the estimate
  as a small `~Nm` mono chip next to the title.
- **`pickNextAction`** (`src/lib/nextAction.ts`): pure function — first
  incomplete MIT by creation order, else first incomplete non-MIT task,
  else `null`. The single source of truth both Focus Mode and the Stuck
  overlay use to decide "what's next," so they never disagree.
- **Focus Mode** (`RightNowCard` + `FocusMode`): an amber-tinted "Right
  now" card near the top of Today opens a full-screen (`FullScreenOverlay`
  — new, fade-only, distinct from the bounded `Sheet`) view showing
  exactly one task: title, first move (if set) in larger calm text, and
  nothing else. "Start 2 min"/"Start 25 min" launch the shared timer;
  quiet "Done" marks it complete (700ms amber checkmark moment, then
  advances to the next action or a calm "That's the focus for now"); a
  low-key "something else" link reveals a plain-text list of the day's
  other incomplete tasks to switch to.
- **`FocusTimer`** (shared, `src/components/FocusTimer.tsx`): big mono
  countdown, thin amber linear progress bar, start/pause/reset. On
  completion: "Time's up — keep going or take a break?" with "Add 5 min"
  / "Done" — no sound, nothing logged or persisted (this is a starting
  aid, not a productivity-tracking feature, per the phase prompt's
  explicit instruction not to build time-tracking analytics).
- **"I'm stuck" overlay** (`StuckOverlay` + a quiet "Stuck?" pill in
  `TodayHeader`): a `Sheet` that never shows the task list. Shows one tiny
  thing (the top pick's first move, else its title, else a plain input to
  type one thing by hand), warm non-judgmental copy, a "Start 2 min"
  button (same shared `FocusTimer`), and "still stuck — just breathe": a
  60-second countdown with a calm pulsing circle, no account, no
  tracking, closeable any time with no penalty.
- **Tests**: `src/lib/__tests__/nextAction.test.ts` — 6 cases covering
  MIT-over-other priority, creation-order tie-breaking, done/dropped
  exclusion, the non-MIT fallback, and the null/empty case.

### Key decisions

- **Focus Mode is a full-bleed `FullScreenOverlay`; the Stuck overlay
  stays a bounded `Sheet`.** Deliberately different presentations — Focus
  Mode's entire point is blotting out everything else, while the phase
  prompt calls the Stuck overlay "minimal," which the existing sheet
  pattern already conveys. Both share the same `FocusTimer` regardless,
  since the timer itself doesn't care what's wrapping it (see
  DECISIONS.md for why `FocusTimer` renders no layout wrapper of its
  own).
- **`AddTaskInline` unifies task-creation UI** in the two places tasks
  get created on Today (the MIT input, the tomorrow-focus step), rather
  than duplicating the first-move/estimate toggle logic — same reasoning
  as extracting `Sheet` in 2A: this exact multi-field-reveal pattern
  showing up twice was worth the extraction.
- **Nothing about focus-timer usage is persisted.** No session count, no
  total-focused-minutes, no streak. This is a deliberate product
  boundary, not an oversight — see the phase prompt's explicit
  instruction and CLAUDE.md's "no guilt language" / "skipped is neutral"
  principles, which this extends to "time spent" as well.

### Known issues / follow-ups

- No settings surface yet to disable/adjust Focus Mode's 2/25-minute
  presets — hardcoded for now, reasonable given there are only two and
  they match the phase prompt exactly.
- `StuckOverlay`'s breathing-moment "Close" button returns to the main
  prompt view rather than closing the whole sheet outright (closing the
  sheet entirely is still one tap away via backdrop/Escape, consistent
  with every other dialog in the app). Revisit if that reads as
  surprising in practice.

## Phase 2B.1 — Visual polish pass on the Focus/Stuck surfaces

UI-only. No logic, data, timer behavior, or `pickNextAction` changes —
confirmed by the full test suite passing unmodified (21/21).

### What was built

- **New tokens** (`src/styles/tokens.css`): `--shadow-elevated` (a soft,
  large omnidirectional shadow plus an inset top-edge highlight, tuned per
  theme) and `--breathe-glow` (a radial gradient blending a warm amber
  center into a cool ink-blue edge, per theme) — wired into
  `tailwind.config.js` as `shadow-elevated`. A `breathe` keyframe (slow
  4s scale+opacity pulse) and `.breathe-pulse` class, with an explicit
  `transform: none !important; animation: none !important` override in
  the existing `prefers-reduced-motion` block — the same pattern already
  used for `.ios-press`/`.ios-sheet`, extended to cover this new case.
- **"Stuck?" pill redesigned** (`TodayHeader`): now a warm `bg-accent-wash`
  pill with a new `IconLifebuoy` icon and `text-accent`, given its own
  top-right position aligned to the date/greeting block (previously
  crammed inline with the greeting sentence, which read as "awkwardly
  floating").
- **`Sheet` given real elevation**: `shadow-elevated` (replacing the
  thinner `shadow-sheet`/`shadow-card` split), `backdrop-blur-sm` on the
  dimmed backdrop, `max-w-lg` (up from `max-w-md`) and `p-6 md:p-8` (up
  from `p-5`) for more generous, considered spacing and desktop presence.
  This is shared infrastructure — `CaptureDialog` and
  `EveningReviewDialog` inherit the same elevation for free, which is a
  deliberate, desired side effect (one consistent premium sheet
  everywhere), not scope creep.
- **`StuckOverlay` hierarchy improved**: a small `IconLifebuoy` badge
  (`bg-accent-wash` circle) above the headline for warmth; headline
  promoted to `font-display text-title` (previously plain `text-headline`)
  so it reads as a considered statement, not a form label; the
  input/one-thing display bumped from `rounded-md` to `rounded-lg`;
  "Start 2 min" is now a full pill with `shadow-fab` (the same soft amber
  glow already used for the capture FAB) so it reads as clearly primary;
  "Still stuck — just breathe" gained a touch more top margin.
- **`BreathingMoment` redesigned**: the flat gray disc is now a
  `breathe-pulse` circle filled with `var(--breathe-glow)` — a soft,
  slow-pulsing warm/cool radial glow instead of a static disc. Countdown
  number unchanged in position (below the circle), just restyled
  slightly. Verified the reduced-motion override is correctly scoped in
  code (see DECISIONS.md); couldn't toggle the OS-level media feature
  live in this sandboxed browser to demo it, but it follows the exact
  proven pattern already shipping elsewhere in this file.
- **`FocusTimer` rebuilt around a circular SVG progress ring** — replacing
  the flat linear bar: an amber arc (`stroke-dashoffset` animated) around
  a faint `--grid-empty` track, with the big mono countdown centered
  inside. Pause/Reset (and the "time's up" Add-5-min/Done pair) are now
  full pill buttons, primary one carrying `shadow-fab`.
- **`FocusMode` buttons** updated to match: `rounded-full` + `shadow-fab`
  on the primary "Start 2 min", pill shape on "Start 25 min"/"Done" too,
  for visual consistency with the rest of the new language.

### Key decisions

- **Reused existing tokens where they already fit** rather than adding
  new ones for the sake of it: the "Stuck?" pill's warm tint is
  `--accent-wash` (already exactly "a very low-opacity amber tint"), and
  every new primary CTA's glow is the existing `--shadow-fab` (already
  designed as a soft amber glow for the capture FAB) — both reused
  verbatim rather than duplicated under new names.
- **`Sheet`'s elevation upgrade applies to all its consumers**, not just
  the Stuck overlay, since it's shared infrastructure and the phase
  prompt's own complaint ("small/lost on desktop") was about the sheet
  primitive itself, not something specific to Stuck. No behavior changed
  for `CaptureDialog`/`EveningReviewDialog`, only presentation.
- **`FocusMode`'s full-bleed `FullScreenOverlay` shell was left alone.**
  The "feels small/lost on desktop" complaint doesn't apply to something
  that already fills the entire viewport — that specific complaint was
  about the bounded `Sheet` (used by the Stuck overlay). Only FocusMode's
  *internal* button styling was updated for visual consistency with the
  new pill/glow language.

### Known issues / follow-ups

- The `frontend-design` skill referenced in this phase's prompt doesn't
  exist on this machine (no `/mnt` path here) — proceeded using the
  app's own established design-token conventions and general premium-iOS
  design judgment instead. Flagged to the user at the start of the turn.
- Reduced-motion behavior for `.breathe-pulse` is verified by code
  inspection only (matches the proven `.ios-press`/`.ios-sheet` pattern)
  — not demoed live, since this sandboxed browser has no control to
  toggle the OS-level `prefers-reduced-motion` media feature.

## Phase 3 — Inbox: capture-and-process

The frictionless review layer for everything `CaptureItem` already
collects. New `/inbox` screen; no changes to how capture itself works.

### What was built

- **Inbox list**: `captures.getUnprocessed()`, newest first, each row a
  calm text + relative mono timestamp (`formatRelativeTime` — "2h ago",
  new in `src/lib/dates.ts`). The bottom tab bar and left rail both show a
  quiet amber count badge on Inbox (`getUnprocessedCount()`), hidden at
  zero — no red, per the phase prompt.
- **Processing panel** (`ProcessSheet` + 4 large `ActionTile`s: Task /
  Habit / Note / Someday, plus Edit/Delete):
  - **Task** (`TaskConvertForm`): title prefilled from the capture text,
    date quick-chips (Today/Tomorrow/This week — "this week" resolves to
    the coming Sunday, since `Task.date` is a single ISO date with no
    separate "week" concept), an MIT toggle that live-checks that date's
    MIT count and swaps itself for a calm note at the cap instead of
    blocking, goal chips (only rendered if any active goals exist), and
    the same first-move/~min reveal-toggles as `AddTaskInline`.
  - **Habit** (`HabitConvertForm`): name/cue/target, and at the 5-active
    cap the Save button itself relabels to "Save as paused" (see
    DECISIONS.md — `habits.create` now accepts an explicit `status`).
  - **Note**: appends the capture text (tagged "— from inbox") to today's
    `JournalEntry`, creating one if none exists yet; immediate action, no
    intermediate form.
  - **Someday**: immediate, tags the item and it disappears from the main
    list into a collapsible "Someday / maybe" section at the bottom.
  - **Edit**: a plain text field to fix a capture's wording before
    processing; saving returns to the 4-action chooser rather than
    closing, so the very next tap can pick a destination.
  - **Delete**: soft-delete, same pattern as everywhere else in the app.
  - All four destination actions call `capturesRepo.markProcessed` (or
    `markSomeday`) — the capture disappears from the live-queried list
    the instant the write lands, no manual refresh.
- **Keyboard flow** (desktop): `j`/`k` move a highlighted selection;
  with an item selected, `t`/`h`/`e` jump straight into the Task/Habit/Edit
  form (skipping the 4-tile chooser), while `n`/`s`/Backspace fire the
  Note/Someday/Delete actions immediately without opening any sheet at
  all — the row just vanishes, which reads as fast triage rather than a
  missing confirmation. A quiet `j/k · t/h/n/s/e/⌫` hint row sits under
  the list, shown only on desktop (`md:flex`) since it's meaningless
  without a keyboard.
- **Inbox zero state**: "Inbox zero. Nothing to sort." — shown whenever
  the main list is empty, even if Someday items remain.
- **Shared helpers** (`src/lib/inboxActions.ts`): `convertCaptureToNote`,
  `convertCaptureToSomeday`, `deleteCapture` — used by both the sheet's
  tap-driven buttons and the page's keyboard handler, so the two paths
  can never disagree about what these actions actually do.
- **Schema v3**: `CaptureItem.someday?: boolean` (see DECISIONS.md for
  why this is a separate flag rather than reusing `convertedTo.type:
  'someday'`). Not indexed — same boolean-index limitation as
  `processed`/`isMIT`.
- **Tests** (`src/db/__tests__/inbox.test.ts`): capture→task conversion
  sets `processed: true` with the correct `convertedTo`; `markSomeday`
  excludes an item from `getUnprocessed()` while it appears in
  `getSomeday()` and stays `processed: false`; the 6th-active-habit cap
  rejects normally but succeeds with `status: 'paused'`; the 4th MIT for
  a day is rejected. 4 new tests, 25 total, all green.

### Key decisions

- **Someday is a flag, not `processed: true`.** Full rationale in
  DECISIONS.md — the short version is that "processed" should mean "this
  thought became something," and someday items haven't; they're parked,
  reversibly.
- **`habits.create`'s cap check is conditional on the resulting status**,
  not removed. Passing an explicit `status: 'paused'` is the only way to
  bypass it — every existing caller (Today's add-habit form, the seed
  script) is unaffected since none of them pass `status` and so still
  default to `'active'` with the cap enforced exactly as before.
- **Keyboard shortcuts for `n`/`s`/Backspace act immediately; `t`/`h`/`e`
  open a form.** The dividing line is "does this action need more input
  from me." Note/Someday/Delete need nothing else, so making them wait
  for a sheet to animate open would slow down exactly the fast-triage
  workflow this feature exists for.
- **`TaskConvertForm`/`HabitConvertForm` are bespoke, not reuses of
  `AddTaskInline`.** They need more fields (date chips, MIT-cap note,
  goal chips; paused-cap note) than `AddTaskInline`'s single-line
  MIT-only case supports. They mirror its first-move/~min reveal pattern
  for interaction consistency but aren't the same component — forcing a
  shared component here would mean threading a lot of conditional
  complexity through what's currently a clean, single-purpose input.

### Known issues / follow-ups

- No UI yet for un-someday-ing an item back into the main inbox list —
  the repo only exposes `markSomeday`, not the reverse. Natural follow-up
  once there's a concrete need (e.g. from `/insights` or a future
  someday-review flow).
- The "This week" quick-chip's choice of "coming Sunday" as the concrete
  date is a judgment call documented here and in DECISIONS.md, not a
  literal reading of the phase prompt (which didn't specify which day)
  — worth revisiting if it doesn't match how planning actually happens
  in practice.

## Phase 4A — Goals cascade

### What was built

- **Goals list** (`/goals`, `GoalsPage.tsx`): active yearly goals as
  inset-grouped cards (`GoalCard.tsx`). Each shows the title (display
  font), an italic "why" line, and a mono progress % (from
  `goalsRepo.progress()`, reactive via `useLiveQuery`). Tapping a card
  expands it in place to show its milestones grouped under mono month
  labels (`formatMonthLabel` in `src/lib/dates.ts`, e.g. "AUG"), sorted
  chronologically by the `YYYY-MM` `month` string. Collapsing re-hides
  them; no data is lost, it's a pure UI toggle.
- **Milestone rows**: a quiet circle-checkbox tap toggles `active` ↔
  `done` (`milestonesRepo.setStatus`); done gets a subtle strikethrough
  and a filled amber circle with a checkmark — never a harsh color.
- **Create/Edit goal** (`GoalForm.tsx`, a `Sheet`): title, "why" textarea
  with a small helper prompt, year (defaults to current year). The
  5-active-goal cap is a **soft** nudge — `rules.isAtGoalSoftCap()`
  returns a boolean (never throws), and the form shows "Focus beats
  breadth — consider finishing or pausing one first" while leaving Save
  fully enabled. Reused for editing an existing goal via the overflow
  menu (nudge text only shows when creating, never when editing).
- **Add milestone**: inline "+ add milestone" affordance within an
  expanded goal card, following `AddTaskInline`'s lightweight
  reveal-a-form-then-collapse pattern. Uses a native `<input
  type="month">` for the month picker since its value format
  (`YYYY-MM`) already matches `Milestone.month` exactly.
- **Archived section**: goals with `status: 'achieved' | 'dropped'`
  (`goalsRepo.getArchived()`, a new `.anyOf(['achieved', 'dropped'])`
  query) live in a collapsed "Archived (N)" list at the bottom, each row
  just title + a quiet status label — no actions, kept simple since
  reactivating an archived goal wasn't in scope.
- **Overflow menu**: a quiet "⋯" (`IconMore`, new) on each expanded
  card's footer opens a small absolute-positioned menu — Edit, Mark
  achieved, Mark dropped — instead of loud inline buttons. A full-screen
  invisible backdrop closes it on outside click.
- **Habit → goal link**: the same goal-chip-picker pattern already built
  for `TaskConvertForm` (a row of toggleable pill buttons, one per
  active goal) was added to both `TodayHabits`'s `AddHabitForm` and
  Inbox's `HabitConvertForm`. Fully optional — `goalId` stays
  `undefined` if no chip is tapped, and the picker doesn't render at all
  when there are no active goals yet.
- **Empty state**: "What's the shape of this year?" / "Add a goal when
  you're ready." when there are zero active goals (archived goals, if
  any, still show below).
- **Tests** (`src/db/__tests__/goals.test.ts`): `goals.progress()` for
  zero milestones, a partial ratio (rounds to nearest %), and exclusion
  of soft-deleted milestones; `goals.getArchived()` returns only
  achieved/dropped and excludes active; `isAtGoalSoftCap()` is false
  under 5, true at 5, and — critically — still allows creating a 6th
  goal (asserts `getActive()` returns 6, proving the cap never blocks).
  5 new tests, 30 total, all green.

### Key decisions

- **The soft cap lives in `rules.ts` as a plain boolean function, not a
  `RuleViolationError`.** Every other cap in the app throws to hard-block
  the write; goals are explicitly a nudge per the phase spec, so
  `isAtGoalSoftCap()` never throws — the UI reads it and shows an
  advisory line, but `goalsRepo.create()` itself has no cap check at all.
  See DECISIONS.md.
- **Milestone month values are plain `YYYY-MM` strings, matching
  `monthKey()`**, so `<input type="month">` can bind to them directly
  with no format translation, and grouping/sorting is a plain
  `localeCompare` on the string.
- **The overflow menu bundles Edit with Mark achieved/Mark dropped**
  rather than adding a separate visible Edit affordance — the phase
  prompt only specified the archive actions needed to be quiet/hidden,
  and a single "⋯" affordance per card stays consistent with that intent
  without adding a second icon button.

### Known issues / follow-ups

- Archived goals are display-only — no "reactivate" action yet. Natural
  follow-up once there's a concrete need (e.g. reopening a goal
  abandoned earlier in the year).
- The overflow menu is a plain absolute-positioned `<div>`, not a
  reusable "Menu" component — if a third place in the app needs the same
  pattern, that's the point to extract it rather than to keep copying.

## Phase 4B — Week view

### What was built

- **Header** (`WeekPage.tsx`): mono week range + a pragmatic week number
  ("AUG 3–9 · WEEK 32") via two new `src/lib/dates.ts` helpers,
  `formatWeekRange` and `weekNumber`, plus `<` `>` buttons that step the
  page's `weekOf` state by ±7 days. Defaults to the current week
  (`weekOf(todayISO())`) on load.
- **Weekly priorities** (`WeekPriorities.tsx`): up to 3 rows for the
  week (`weeklyPrioritiesRepo.getForWeek`), each a tap-to-toggle circle
  (done → amber check + strikethrough, exactly like `MilestoneRow`'s
  pattern) plus a quiet "⋯" menu for **Carry to next week** (moves the
  record to `weekOf + 7d` via `update()`, after checking
  `canAddWeeklyPriority` on the destination week and showing a calm
  note if that week's already full) and **Drop** (`setStatus`ed to
  `'dropped'`, which removes it from view — no separate archive section
  was asked for here, unlike Goals). Linking reuses the exact
  goal-chip-picker pattern from `TaskConvertForm`; when set, the row
  shows a muted mono breadcrumb ("→ Ship a side project"). **Hard cap
  at 3**: proactively hidden once reached (the "+ add priority"
  affordance is replaced by "Three is enough for one week."), backed by
  the pre-existing `canAddWeeklyPriority`/`RuleViolationError` path in
  `rules.ts` as defense-in-depth — same enforcement shape as the MIT
  cap, not the Goals soft-nudge pattern.
- **Week grid** (`WeekGrid.tsx`): `tasksRepo.getForWeek(weekOf)` grouped
  by date into 7 day cells. A single responsive CSS grid
  (`grid-cols-1 md:grid-cols-7`) serves both layouts described in the
  phase prompt — one column of stacked full-width day sections on
  mobile, 7 side-by-side columns on desktop — rather than two separate
  components. Each task row shows a small amber dot for `isMIT` and the
  existing `IconGoals` glyph when linked to a goal or weekly priority.
  Desktop adds native HTML5 drag-and-drop (`draggable`, `onDragStart`/
  `onDragOver`/`onDrop`, no new dependency) to reschedule a task between
  day columns; the same rows are tappable on both layouts to open the
  edit sheet, since drag is a no-op on touch without extra plumbing.
- **`TaskEditForm.tsx`** — the first generic multi-field task editor in
  the codebase (previously only creation forms existed). Fields: title,
  a Today/Tomorrow chip pair plus a day-of-week picker built from the
  currently-viewed week's 7 dates (`formatDayHeader`, a new mono "MON
  3"-style helper), the MIT toggle (excluding the task being edited
  from that date's MIT count, so re-saving the same MIT doesn't
  double-count against the cap), an optional first-move reveal, and
  both goal and weekly-priority chip pickers (independent — a task can
  link either, both, or neither). Opened by tapping any task row in
  `WeekGrid`.
- **Tests**: `src/lib/__tests__/dates.test.ts` (new) covers `weekOf`
  round-tripping through `addDays(±7)`, `weekNumber` incrementing/
  decrementing by exactly 1 across a week navigation, and
  `formatWeekRange` for both a same-month and a cross-month week.
  `src/db/__tests__/weeklyPriorities.test.ts` (new) covers the 3-cap
  rejecting a 4th `RuleViolationError`-style, a dropped priority not
  counting against the cap, and one week's cap not affecting another
  week's. 9 new tests, 39 total, all green.

### Key decisions

- **Weekly priorities are a hard cap, not a soft nudge** — reusing the
  existing `canAddWeeklyPriority`/`RuleViolationError` machinery
  unchanged. This is deliberately the opposite choice from Goals'
  `isAtGoalSoftCap` (see DECISIONS.md): the phase prompt was explicit
  that priorities are "a weekly cognitive-load limit, closer to MITs
  than to goals," so the UI proactively hides the add affordance at 3
  rather than letting the user push past it.
- **"Carry to next week" moves the record rather than duplicating it.**
  A carried priority keeps its id/history and simply gets a new
  `weekOf` — there's no "carried" status in the `WeeklyPriority` type,
  and inventing one (or duplicating + dropping the original) would add
  a second source of truth for something that's really just "this
  belongs to a different week now."
- **Priority linking is goal-level only, not milestone-level.** The
  phase prompt's example breadcrumb ("→ Ship a side project") is a goal
  title, and no milestone-picker UI exists anywhere to reuse — building
  one would be new surface area beyond what the example asked for.
  `WeeklyPriority.milestoneId` remains a valid, unused-by-this-UI field.
- **One `WeekGrid` component for both breakpoints**, not a separate
  mobile list and desktop grid. The phone/desktop divide the prompt
  describes is just a `grid-cols-1` → `grid-cols-7` responsive change;
  splitting it into two components would duplicate the row rendering
  and the drag/tap wiring for no benefit.
- **`TaskEditForm` is the first reusable multi-field task editor.**
  Everywhere else in the app only creates tasks (`AddTaskInline`,
  `TaskConvertForm`); editing an existing task never had a home before
  now. It's intentionally not merged with `TaskConvertForm` — that one
  is tied to converting a specific capture and always creates; this one
  always edits an existing id and has no capture/conversion concept.

### Known issues / follow-ups

- Drag-and-drop is native HTML5 DnD with no library — it works well for
  the single mouse-drag case this phase needs, but has no touch-device
  equivalent by design (mobile uses tap-to-edit instead, per the
  prompt). If touch reordering is ever wanted, that's a deliberate new
  feature, not a bug fix.
- `weekNumber()` is a pragmatic Monday-count, not ISO-8601 week
  numbering — documented inline and in DECISIONS.md so it's never
  mistaken for a calendar-standard week number if this ever needs to
  interoperate with an external calendar.

## Phase 4B follow-up — Week view desktop layout fix

### What was built

UI-only fix: on real desktop widths, `/week`'s 7-column grid was
squeezed into the app's shared 720px prose-width column (the same one
Today/Journal/Goals/Inbox use), truncating task titles into
near-unreadable single-line fragments ("Plan t...", "Book ...") while
most of the screen sat empty.

- **`AppShell.tsx`** now reads the current route (`useLocation`) and
  applies `max-w-content-wide` (a new token, `--content-max-width-wide:
  1400px` in `tokens.css`) only when `pathname === '/week'`; every other
  route still gets the unchanged `max-w-content` (720px). Verified in
  the browser that Today/Goals both still measure exactly 720px.
- **`WeekGrid.tsx`**: task titles switched from single-line `truncate`
  to `md:line-clamp-2 md:whitespace-normal` — 2-line wrap on desktop,
  falling back to a line-clamp ellipsis only when a title still
  overflows 2 lines. Mobile keeps the original unprefixed `truncate`
  untouched. Day-card padding bumped `md:px-4 md:py-4` (from `px-3
  py-3`) and header-to-rows spacing `md:mt-3` (from `mt-1`), row height
  `md:py-2.5` (from `py-2`) — all as `md:`-only additions so the base
  (mobile) classes, and therefore the mobile layout, are byte-for-byte
  unchanged. The day-column gap was deliberately left at `gap-3` (not
  increased) — see Key decisions.

### Key decisions

- **The wider cap (1400px) doesn't fully "kick in" at 1280px** — at
  that viewport, available width after the 240px rail and page padding
  is only ~950–1000px, well under the 1400px cap, so the grid just uses
  all available space rather than being capped. This is expected and
  fine: the fix's job at 1280 is making the *available* space read
  well, not manufacturing extra space that isn't there. Verified with
  real task titles ("Book dentist appointment", "Pick up dry cleaning")
  reading fully at 1280–1512px, and even long ones ("Draft the
  quarterly proposal document for review") wrapping to a clean 2-line
  clamp rather than a single-word fragment.
- **Column gap stayed at `gap-3` rather than growing on desktop.** An
  earlier pass bumped it to `md:gap-5`, but at 1280px that alone ate
  ~48px that would otherwise go to column content — since 7 columns
  compete for the same fixed width, gap and padding are directly
  traded against legibility. Keeping the gap at its existing size and
  only growing padding modestly (`px-3`→`px-4`) was the better trade at
  the smallest verified desktop width.

### Known issues / follow-ups

None — this was a scoped, UI-only fix. `npm run build` and `npm run
test` both stayed green throughout (39 tests, unchanged), confirming
no logic was touched.

## Layout audit fixes (4 targeted bugs)

A dedicated audit pass (see the audit findings, not repeated here)
checked every real page at 375/768/900/1024/1280/1440/1728px, both
themes at the two extremes. It surfaced one severe bug and three
moderate ones; this phase fixed exactly those four and nothing else.

### What was built

- **`WeekGrid.tsx` — grid breakpoint raised from `md` to `xl`.** The
  7-column desktop grid was activating at the same 768px breakpoint as
  the nav's bottom-tabs→left-rail switch. With the rail eating 240px,
  each column narrowed to ~47px and task titles collapsed to fragments
  like "D. t…" across roughly 768–1024px. Changed
  `grid-cols-1 md:grid-cols-7` to `grid-cols-1 xl:grid-cols-7` (Tailwind's
  1280px breakpoint) — the existing stacked vertical day-list (already
  proven readable down to 375px) now simply continues rendering through
  the whole 768–1279px range instead of switching early. All the other
  `md:`-scoped spacing/line-clamp treatment on day cards was left as-is,
  since single-column cards benefit from the roomier padding at any
  width ≥768px; only the column-count switch itself needed to move.
  Verified: 1024px now shows the full single-column list with every
  seeded title reading in full (no wrapping needed, cards are wide
  enough); 1280px still switches to the verified-working 7-column grid.
- **`WeekPage.tsx` — mobile FAB clearance.** The root div gained
  `pb-16 md:pb-0`. `AppShell`'s shared bottom padding
  (`nav-height + safe-area + 1.5rem`) only clears the bottom tab bar —
  it doesn't reserve room for the taller capture FAB that floats above
  the tab bar (`nav-height + safe-area + 1rem` offset, plus the FAB's
  own `3.5rem` height). That shortfall is normally invisible because
  most pages' last element ends before the boundary; Week's stacked day
  cards are the one place content routinely reaches exactly that zone.
  Rather than change the shared `AppShell` padding (which would touch
  every page, including ones the audit marked fine), the extra ~3rem of
  clearance was added locally to `WeekPage` only. Verified by scrolling
  to the very bottom of the day-list at 375px — the last card now sits
  fully clear of the FAB.
- **`InboxRow.tsx` — capture text now line-clamps to 2 lines.**
  Replaced single-line `truncate` with `line-clamp-2` (unconditional,
  not breakpoint-gated — unlike Week's rows, Inbox rows were truncating
  even on desktop with ample width). Row alignment switched from
  `items-center` to `items-start` with a `mt-0.5` nudge on the relative
  timestamp so it still sits near the first line rather than
  vertically centering against a now-taller 2-line block. Verified at
  375px and 1280px, both themes: realistic long captures ("Ask Sarah if
  she can cover my shift next Tuesday since I have a doctor's
  appointment") now read in full over 2 lines instead of cutting to
  "...since I hav…".
- **`TodayHabits.tsx` — habit names now line-clamp to 2 lines.** Same
  treatment as above: `truncate` → `line-clamp-2` on `habit.name`,
  `items-baseline` → `items-start` on the row so the "X of Y ✓" badge
  aligns to the top of a potentially 2-line name instead of its
  baseline. Adjusted the internal rhythm below a taller name: the cue
  subtext's top margin grew `mt-0.5` → `mt-1`, and the week-strip's top
  margin grew `mt-2.5` → `mt-3`. Verified at 375px, 1280px, and desktop
  width, both themes: "Practice guitar for at least fifteen minutes"
  now reads in full over 2 lines instead of "Practice guitar for at
  least fift…".

### Key decisions

- **Fixed the FAB-clearance gap locally on `WeekPage`, not in the
  shared `AppShell`.** The root cause (FAB height not accounted for in
  the shared bottom-padding calc) is arguably present on every page,
  but the audit only observed it as a real, visible problem on Week —
  every other page's content happens to end before that zone. Changing
  the shared padding would be an unrequested, unscoped change touching
  pages the audit explicitly marked fine; a local fix on the one page
  that actually exhibits the bug is the minimal, correctly-scoped
  change. If a future page grows long enough to hit the same gap, this
  same one-line pattern (`pb-16 md:pb-0` on the page root) is the one
  to reach for.
- **Only the grid-cols breakpoint moved to `xl`, not the day-card's
  other `md:` styling.** The narrow-column problem was specifically
  about splitting width 7 ways too early — a single full-width day card
  at 768–1279px was never illegible, so there was no reason to also
  delay its nicer padding/line-clamp/spacing treatment to `xl`. Moving
  only the one utility that caused the regression keeps the change
  minimal and easy to reason about.
- **Inbox and Today's habit-name fixes are unconditional 2-line clamps
  (no `md:` gating)**, unlike Week's task rows which deliberately kept
  mobile on single-line `truncate`. That distinction was intentional in
  Week (an explicit prior instruction to leave mobile pixel-identical
  during a desktop-only pass); no such constraint applied here — both
  bugs were described as happening "at every width," so the fix applies
  at every width too.

### Known issues / follow-ups

None. All four fixes are scoped exactly to the audit's findings;
nothing else was touched. `npm run build` (zero errors) and `npm run
test` (39 tests, all green, unchanged) confirm no regressions.

## Wide content column made the AppShell default

### What was built

- **`AppShell.tsx`** no longer branches on `location.pathname` — the
  `useLocation`-based `/week`-only check is gone, and `<main>` always
  gets `max-w-content-wide` (1400px). Every route (Today, Inbox, Week,
  Goals, and any future route like Journal/Insights) now shares the
  same wide column and identical left/right edges automatically,
  without needing this fix repeated per-page.
- **Prose text gets a local, narrower cap instead of the whole page
  narrowing.** Two spots render genuinely freeform sentence-length
  text: a goal's "why" line (`GoalCard.tsx`) and a capture's text
  (`InboxRow.tsx`). Both now carry `max-w-content` (720px, the same
  token that used to be the page-wide default) directly on the text
  element — the surrounding card/row stays full wide-column width, only
  the sentence itself stops stretching past a comfortable reading
  length. Below 720px this class has no effect (content is already
  narrower), so nothing changes on mobile.
- **`InboxRow.tsx`** also picked up `justify-between` on the row. This
  was necessary, not cosmetic: once the capture-text `<p>` has a
  `max-width`, a plain (non-`justify-between`) flex row leaves the
  timestamp sitting right next to the now-narrower text with a large
  dead gap after it, instead of pinned to the row's right edge.
  `justify-between` restores the anchored-right timestamp regardless of
  how much slack the capped text leaves.
- **`tokens.css`** comments updated in place: `--content-max-width`
  (720px) is now documented as the prose-reading-width token (used
  locally on text elements), and `--content-max-width-wide` (1400px)
  as the page-column default every route gets.

### Key decisions

- **Wide is the `AppShell` default, not an opt-in per page.** The
  previous `/week`-only branch was called out explicitly as something
  to remove — a future Journal/Insights page (or anything else) should
  get the wide column for free rather than needing this same
  route-check duplicated. If a route ever genuinely needs the narrow
  720px page (none do today), that would be a deliberate, explicit
  exception again, not the default.
- **Structural width vs. reading width is a per-element choice, not a
  per-page one.** Rather than reintroducing any page-level narrowing,
  individual freeform-text elements (goal why, capture text) get
  `max-w-content` directly. This keeps every card/row/list at full
  page width — matching Week's alignment exactly — while still
  preventing a single long sentence from stretching unreadably wide.
  Short captions and labels (habit cue, task first-move) were
  deliberately left uncapped: they're never long enough in practice to
  reach even 720px, so capping them would be a no-op that adds noise
  without preventing anything.
- **Verified the ThemeToggle sits at an identical relative offset from
  `<main>`'s right edge across Today/Inbox/Week/Goals at 1280px** — the
  61px absolute-pixel differences observed in one measurement pass
  were a macOS overlay-scrollbar artifact (scrollbar reserving space on
  some pages depending on content height, not present on others), not a
  real alignment bug; the offset relative to `<main>` itself was
  identical (64px) on every page once measured consistently after a
  full page load.

### Known issues / follow-ups

None. Verified at 1280/1440/1728px in both themes with realistic long
goal-why and capture text, and at 375px to confirm mobile is
unaffected by the wide token. Re-confirmed all four prior audit fixes
still hold: Week's grid-cols-7 still only activates at `xl` (1024px
stays single-column, 1280px switches to 7 columns), the mobile FAB
clearance on Week still leaves the last day-card fully visible, and
both Inbox's and Today's 2-line clamps are unaffected by the width
change. `npm run build` (zero errors) and `npm run test` (39 tests,
unchanged, all green).

## Phase 5A — Journal

### What was built

- **`JournalCalendar.tsx`**: a Monday-first month grid (matching the
  app's established week-start convention) built from a new
  `getMonthGridDays(month)` helper in `dates.ts` — always a whole
  number of complete weeks, including leading/trailing days from
  adjacent months, same as any standard calendar. Mono date numbers;
  today gets a subtle `ring-1 ring-accent-ring`; any day with a saved
  `JournalEntry` (via `journalRepo.getForMonth`) gets a small quiet dot;
  the selected day gets a soft `bg-accent-wash`. `<` `>` month nav
  mirrors Week's header style (`formatMonthYear` — "AUG 2026" — plus
  two `IconChevronRight` buttons, one rotated).
- **`JournalEditor.tsx`**: the entry surface for whichever day is
  selected. A markdown-friendly textarea autosaves via
  `journalRepo.upsertForDate` on an 800ms debounce (a ref-backed
  timer, not component state, so it survives re-renders cleanly), with
  a small fading "Saved" tick (`IconCheck` + text, `opacity` transition,
  always mounted to avoid layout shift) that shows for 1.5s after each
  successful write. **Flush-on-switch**: the hydration effect keyed on
  `date` returns a cleanup that immediately flushes any pending
  debounced save using ref-held values (not React state, which could be
  stale) — since React runs a changed effect's cleanup before the next
  date's setup, this guarantees the outgoing day's last edit is written
  before the incoming day's entry is loaded. The same cleanup also
  covers navigating away from the page (unmount).
- **Mood + Energy**: two rows of 5 dots each (`RatingDots`, shared
  between them), tap-to-set 1–5, written immediately on tap via
  `upsertForDate` — no debounce, since there's no typing to wait out.
  Visually a plain filled/unfilled circle (no numeral), deliberately
  quieter than the Evening Review's numbered 1–5 buttons but built on
  the same "one filled at a time" selection model.
- **Prose-width cap on the editor**: `JournalEditor`'s outer card
  carries `max-w-content` (720px) directly, while `JournalCalendar`
  stays full width — the same structural-vs-prose split established in
  the recent layout correction (goal `why`, capture text). `AppShell`
  was not touched; Journal simply inherits its current wide default and
  narrows only the one prose surface locally.
- **Empty state**: an unwritten day shows "What happened today?" as the
  textarea's placeholder — same calm-invitation microcopy pattern as
  Goals' and Week's empty states, not a blank apology.
- **Inbox notes**: no new code needed — `convertCaptureToNote` (Phase
  3) already appends `"<capture text> — from inbox"` via the same
  `journalRepo.upsertForDate`, so opening that day in the calendar just
  renders the saved text as-is.
- **New `dates.ts` helpers**: `addMonths(month, delta)`,
  `formatMonthYear(month)` ("AUG 2026"), `getMonthGridDays(month)`.
- **Tests**: `src/lib/__tests__/dates.test.ts` gained coverage for all
  three new helpers, including that the grid always starts Monday/ends
  Sunday, contains every day of the target month, and only ever bleeds
  into the immediately adjacent months. `src/db/__tests__/journal.test.ts`
  (new) covers `upsertForDate` creating then merging fields in place,
  `getForMonth` excluding adjacent months and soft-deleted entries, and
  — standing in for the UI-level flush-then-hydrate sequence, since
  this project's test stack has no React Testing Library / fake-timer
  setup to drive a real debounce — a repo-level assertion that saving
  two different dates back-to-back never cross-contaminates their text.
  10 new tests, 49 total, all green.

### Key decisions

- **The debounce timer and "last known text" live in refs, not state.**
  `saveTimerRef`/`textRef`/`dateRef` are read inside the flush function
  and the effect cleanup, both of which need the *current* value at the
  moment they run, not whatever was captured in a stale closure from
  the render that scheduled them. This is the same category of fix as
  `TaskEditForm`'s controlled-input patterns elsewhere, just applied to
  a timer instead of a submit handler.
- **Hydration is a plain async fetch on `[date]`, not a `useLiveQuery`.**
  A live query re-fires on every write — including the component's own
  autosave — which would either need extra guarding against clobbering
  in-progress typing (the same problem `EveningReviewDialog` solved by
  keying its resume effect on `isOpen`, not on live data) or risk a
  race between "loading" (`undefined`) and "confirmed no entry"
  (also `undefined`) for a brand-new date. A one-shot fetch per date
  sidesteps both: it hydrates exactly once per date change and is
  never re-triggered by the component's own saves.
- **The debounce/data-loss test lives at the repo layer, not as a
  simulated UI test.** This codebase's test stack (Vitest +
  fake-indexeddb) has no DOM/timer test harness, so "no data loss on
  rapid day-switching" is verified two ways: a repo-level test proving
  `upsertForDate` never lets two dates' writes bleed into each other,
  and a manual browser pass (typing, switching mid-debounce, reading
  IndexedDB directly) confirming the actual flush-on-cleanup timing
  works end-to-end. Both are necessary; neither alone would catch
  every failure mode.
- **Mood/energy dots reuse the Evening Review's "one selected at a
  time" interaction model but not its visual treatment.** The review's
  numbered circles suit a one-time daily check-in step; the phase spec
  asked specifically for a quieter, unlabeled dot pair sitting above
  the editor at all times, so the visual language differs even though
  the underlying tap-to-select-1-of-5 behavior is identical.

### Known issues / follow-ups

None. Verified at 393px and desktop (1280/1440px), both themes: month
navigation, day selection, typing → autosave → "Saved" indicator →
confirmed in IndexedDB, switching days mid-typing before the debounce
fires → confirmed via IndexedDB that the outgoing day kept its latest
text and the incoming day started clean, mood/energy taps persisting
immediately, and a day carrying an inbox-converted note rendering its
"— from inbox" text faithfully. `npm run build` (zero errors) and
`npm run test` (49 tests, 10 new, all green).

## Journal restructure — entry-first, calendar becomes "History"

### What was built

UI-only restructure; every piece of data logic from Phase 5A (`journal.
upsertForDate`, the debounced-autosave + flush-on-switch guarantee,
mood/energy persistence, the calendar's month-fetch and entry-dot/today-
ring detection) is unchanged — only the visual hierarchy moved.

- **Default view is today's entry, not the calendar.** `JournalPage`
  no longer renders the month grid inline above the editor; on load you
  land directly on today's date header, mood/energy, and a spacious
  composer, no scroll required to start writing.
- **The calendar moved into a "History" sheet.** A quiet pill button
  (new `IconClock` + "History" label) sits in the header's trailing
  slot — the same visual slot `ThemeToggle` occupies on every other
  page. Tapping it opens `JournalCalendar` inside the shared `Sheet`
  component (the established pattern for every overlay in the app,
  chosen over a custom expandable panel for consistency). Selecting a
  day closes the sheet and loads that day into the same editor below;
  entry dots and the today-ring render exactly as before.
- **A "Back to today" affordance** appears next to the date header
  whenever the selected day isn't today, so getting back doesn't
  require reopening History.
- **Mood/Energy shrank into one quiet accessory row.** Both ratings now
  render side-by-side (`flex-wrap` so they still fit at 393px), with
  smaller dots (`h-5 w-5`, was `h-6 w-6`) and a `caption-2` label — a
  quick tap-and-done, not a dominant form section competing with the
  composer for attention.
- **The composer is now the page's visual hero**: `rows={16}`,
  `min-h-[50vh]` (`55vh` on desktop), larger padding (`px-5 py-4`, card
  padding `px-6 py-6`, both up from `px-4`/`py-3`). The prose-width cap
  (`max-w-content`, 720px) stays on the editor card exactly as before.
- **Placeholder copy updated** to "What's on your mind today?" — pure
  `placeholder` attribute text, same as before; it was never saved as
  content and still isn't, just a copy change.
- **`JournalCalendar`'s own outer `bg-surface`/`shadow-card` wrapper was
  dropped** — it now renders as plain content, since it's only ever
  used inside `Sheet`'s own elevated panel, and stacking two nested
  "card" surfaces looked redundant.

### Key decisions

- **Entry-first over calendar-first**, per the phase's stated research
  rationale: what actually keeps someone journaling is friction-free
  access to *today's* blank page, not browsing history — a calendar
  landing screen makes the daily habit (the thing that matters) feel
  like a secondary action behind a browsing UI. This mirrors the
  Today-first pattern already established for the rest of the app:
  Today, Week, and Goals all lead with "what do I do/see right now,"
  with any historical/list browsing (Goals' Archived section, Week's
  `<` `>` nav) tucked behind a quieter affordance, never the default
  view.
- **History replaces `ThemeToggle` in Journal's header slot, rather
  than sitting alongside it.** Every other page's header is a single
  title + single trailing control; adding a second control would break
  that established one-slot convention. Theme is still fully
  switchable from every other page (it's a global preference, not
  per-page state), so nothing is actually lost by not repeating the
  control here — Journal just has a more useful thing to put in that
  slot.
- **Sheet over an inline expandable panel** for History. The app has no
  existing "expand in place" pattern for anything of this size (Goals'
  disclosure sections are for lightweight status lists, not a full
  calendar), while `Sheet` is already the single, consistent way every
  other overlay in the app presents — reaching for a new pattern here
  would be inventing a second convention for no real benefit.

### Known issues / follow-ups

None. Verified at 393px and desktop (1440px), both themes: the page
lands directly on today's entry with no scroll needed, typing still
autosaves (confirmed in IndexedDB), opening History and jumping to a
past day still triggers the flush — confirmed via IndexedDB that an
in-progress edit on the outgoing day was saved before the switch —
mood/energy still persist immediately, and "Back to today" returns
correctly. `npm run build` (zero errors) and `npm run test` (49 tests,
unchanged — this was a UI-only change, no repo/lib logic touched).

## Phase 5B-i — Review engine + weekly review

### What was built

- **`ReviewDialog.tsx`** (new, `src/components/reviews/`): the shared
  step-dialog chrome extracted from the Phase 2A daily review — the
  `Sheet` wrapper, "Step N of M" + title header, Back/Next/Finish
  navigation (Next disabled per-step via an optional `canAdvance` flag),
  and the calm amber completion moment. Callers own everything else: an
  ordered `steps: ReviewStep[]` array (each just `{ render, canAdvance? }`),
  a `resumeStep` (read once, the instant the dialog opens — same
  guarantee the daily review already had), and an `onFinish` callback
  that writes `completedAt`.
- **`ScoreStep.tsx`** (new, same folder): the 1–5 tap-to-rate row,
  extracted out of the daily review so both reviews render an identical
  rating control from one implementation.
- **`EveningReviewDialog.tsx`** (refactored, not rebuilt): now composes
  `ReviewDialog` + `ScoreStep` with its existing score/win/lesson/
  tomorrow-focus state, handlers, and autosave-on-blur/on-select logic
  completely unchanged. Same 4 steps, same resume behavior, same
  completion copy ("Day closed.") — verified via the full existing test
  suite (unchanged, all green) plus a fresh manual pass.
- **Weekly review** (`WeeklyReviewCard.tsx` + `WeeklyReviewDialog.tsx`,
  `src/components/week/`): a 5-step guided review for whichever week is
  currently viewed on `/week`.
  1. **Clear your inbox** — lists `captures.getUnprocessed()`; tapping
     one opens the existing `ProcessSheet` (Task/Habit/Note/Someday)
     *nested* inside the review's Sheet — reused verbatim, not rebuilt.
     Empty state: "Already clear. Nice."
  2. **This week's priorities** — literally `<WeekPriorities
     weekOf={reviewedWeek} />`, the exact same component Week's page
     uses, done/carry/drop and all.
  3. **Check your goals** — one short free-text reflection per active
     goal ("Still on track? Any next action?"), saved into the
     `Review.answers` bag under `goal:<goalId>` keys on blur — no new
     schema, no task creation, deliberately lightweight per the spec.
  4. **Rate your week** — `ScoreStep`, same gating as the daily review
     (Next disabled until scored).
  5. **Next week's priorities** — `<WeekPriorities weekOf={nextWeek}
     heading="Next week's priorities" emptyPrompt="What matters most
     next week?" />` — the same component again, just re-parameterized,
     still respecting the hard 3-cap.
  Finishing writes `Review('weekly', reviewedWeekMonday, { completedAt })`
  and shows "Week reviewed."
- **`WeekPriorities.tsx`** gained two optional props, `heading` and
  `emptyPrompt` (both default to their existing hardcoded text), so the
  exact same component serves Week's page, the "this week" review step,
  and the "next week" review step with zero duplicated priority-row/cap/
  carry logic.
- **`isWeeklyReviewDue(now)`** (new, `dates.ts`): Sunday from 4pm through
  all of Monday — a pure time check, same shape as the daily review's
  `isEvening` check, not tied to which week is being viewed.
- **`resumeStepForWeekly(review)`** (new, `reviewResume.ts`): a coarser
  heuristic than the daily review's, because 3 of the 5 steps (inbox,
  this-week priorities, next-week priorities) have no dedicated field on
  `Review` to infer progress from — see Key decisions below.
- **`WeeklyReviewCard.tsx`**: always rendered on `/week` (unlike the
  daily review's card, which hides outside the evening and once
  completed) — amber ring + wash when due, otherwise quiet; a small
  checkmark if already completed. Never disappears, never scolds.
- **Tests**: `reviews.test.ts` gained a weekly-type upsert test (proving
  'daily' and 'weekly' reviews never collide even when given the same
  periodKey string) and full `resumeStepForWeekly` coverage.
  `weeklyPriorities.test.ts` gained two "carry" tests: moving a priority
  to next week removes it from the old week and lands it in the new one
  (same id, same title — not a duplicate), and carrying frees a slot in
  the original week for a new priority. `dates.test.ts` gained
  `isWeeklyReviewDue` coverage for the Sunday boundary, all of Monday,
  and every other day. 11 new tests, 60 total, all green.

### Key decisions

- **`resumeStepForWeekly` is a coarser heuristic than the daily
  review's, by necessity.** The daily review can infer progress exactly
  because every step maps to a specific `Review` field (score, win,
  lesson). Three of the weekly review's five steps are action steps
  (inbox processing, this/next week's priorities) with no equivalent
  field — a capture being processed or a priority being carried leaves
  no trace on the `Review` record itself. So resume only distinguishes
  three states: nothing recorded yet → step 1 (cheap to skim back
  through, since the inbox/priority steps show an instant empty/already-
  clear state if there's nothing left to do); a goal check-in note
  exists → step 4; a score exists → step 5. This is honest about what
  the data can support rather than pretending to a precision it doesn't
  have — documented inline and in DECISIONS.md so it isn't "fixed" into
  something more precise than the underlying signals allow.
- **Steps 2 and 5 reuse `WeekPriorities` itself, not a bespoke read-only
  view.** The phase spec asked to "reuse existing logic from Week's
  priority row" — reusing the whole component (not just extracting
  `PriorityRow`) means the review steps get every existing behavior
  (add, done, carry, drop, the hard cap, the goal-chip picker) for free,
  and any future change to how priorities work only has to happen once.
  The two new `heading`/`emptyPrompt` props are the only change needed
  to make one component serve three different call sites correctly.
- **`ProcessSheet` is nested inside `ReviewDialog`'s `Sheet` rather than
  reimplemented.** Both are the same `Sheet` component stacked at the
  same z-index; the later-mounted one paints on top and its own overlay
  dims everything below, which reads correctly as "a sheet opened from
  within a sheet" — the standard pattern the design already uses
  elsewhere (e.g. `TaskConvertForm` inside `ProcessSheet` inside
  `InboxPage`), just one level deeper here.
- **The weekly review's entry point never hides, unlike the daily
  review's.** `EveningReviewCard` only renders in the evening and before
  completion — a deliberate choice from Phase 2A for a review that's
  meant to close out one specific day. The weekly review's phase spec
  explicitly called for "never scolds if skipped... stays available," so
  `WeeklyReviewCard` always renders regardless of due-window or
  completion status; only its visual weight (ring + wash vs. plain)
  changes.

### Known issues / follow-ups

None. Verified in-browser with real unprocessed captures, real weekly
priorities (including a goal-linked one), and a real active goal: all
5 steps walked end-to-end — a capture converted to a task from inside
the review (confirmed `processed: true` + the new task in IndexedDB), a
priority marked done, a goal check-in note saved (confirmed via
`Review.answers`), a score selected, a next-week priority added and
confirmed to land on the correct week (not the reviewed week) — finish
showed "Week reviewed." and reopening resumed at the right step. One
false alarm during manual testing turned out to be this browser
automation environment not delivering synthetic `blur` events at all
(reproduced with a plain native `<input>`, no React involved) — real
click-driven focus changes confirmed the goal-note autosave works
correctly; not an app defect. `npm run build` (zero errors) and
`npm run test` (60 tests, 11 new, all green).

## Investigation — "Close the day" card reportedly not appearing after Phase 5B-i

**Not a bug.** `TodayPage.tsx` was never touched by the Phase 5B-i
commits — `git show --stat` on both `9f72b54` (engine extraction) and
`16ddfe4` (weekly review) confirms only `src/components/reviews/*`,
`EveningReviewDialog.tsx`, `src/components/week/*`, and
`WeekPage.tsx` changed. The gating logic in `TodayPage.tsx` is byte-
identical to before the refactor: `isEvening = now.getHours() >= 18`,
`showEveningCard = isEvening && !dailyReview?.completedAt`.

Checked IndexedDB directly: the `reviews` table was completely empty
(no stale `completedAt` from earlier testing either — that table had
already been cleared down to nothing during the Phase 5B-i verification
pass). So the card's absence was explained by neither a broken refactor
nor stale test data — it was simply **15:00 local time** when checked,
before the 18:00 evening threshold. The card is correctly hidden until
evening; this is the gate working exactly as designed.

**Verified with real rendering, not just a code read**: temporarily
forced `isEvening = true` in `TodayPage.tsx` (a verification-only edit,
confirmed reverted via `git diff` showing no changes before committing
anything), reloaded, and confirmed the "Close the day" card renders.
Walked the full 4-step flow through a real click sequence — score
selection, win, lesson, tomorrow's focus, Finish — and confirmed:
the "Day closed." completion moment renders identically to before the
refactor; the `Review` row lands correctly (`type: 'daily'`, correct
`periodKey`, `score` and `completedAt` both set); and today's Year
Grain cell fills (`background: var(--ink)`, `opacity: 0.82` for a
score of 4, with the today outline ring intact) — confirming the
refactored `ReviewDialog`/`EveningReviewDialog` writes through to the
same places the pre-refactor implementation did. No code changes were
needed or made; the temporary override was reverted before running
`npm run build`/`npm run test` (both clean, unchanged) and the test
review record was cleared from IndexedDB afterward.

## Phase 5B-ii — Monthly and yearly reviews

Built the monthly and yearly reviews on `/goals`, both reusing the
`ReviewDialog` engine and `ScoreStep` from Phase 5B-i, so all four
review types (daily, weekly, monthly, yearly) now share one step-dialog
engine with a consistent resume-on-reopen guarantee and completion
moment.

### What was built

- **`milestones.getForMonth(month)`** — a new repo query on the
  indexed `month` field, filtered `!deletedAt`, used by the monthly
  review's cross-goal milestone audit (milestones don't otherwise have
  a "find everything due this month across all goals" query).
- **`isMonthlyReviewDue`/`isYearlyReviewDue`** in `dates.ts` — pure
  time checks mirroring `isWeeklyReviewDue`'s shape. Monthly's window
  is the last 3 days of the current month through the 3rd of the next
  (so it survives crossing a month boundary without vanishing);
  yearly's is December 20 through January 10.
- **`resumeStepForMonthly`/`resumeStepForYearly`** in
  `reviewResume.ts` — coarser heuristics than the daily review's (see
  Key decisions below).
- **`ReviewEntryCard`** — extracted the entry-point card shape
  (title/subtitle/onOpen/isDue/isCompleted) out of `WeeklyReviewCard`
  into a shared primitive. `WeeklyReviewCard` is now a 9-line wrapper;
  `MonthlyReviewCard` and `YearlyReviewCard` are new equally-thin
  wrappers around the same component.
- **`MonthlyReviewDialog`** (3 steps): audit this month's milestones
  across every active goal with done/carry-to-next-month/drop actions
  (carry moves the record's `month` field forward in place, same
  pattern as weekly-priority carry — does not duplicate); rate the
  month (`ScoreStep`); optionally add a milestone for next month per
  goal. Finishing writes `Review(type: 'monthly', periodKey: YYYY-MM)`.
- **`YearlyReviewDialog`** (3 steps): reflect on the year via three
  free-text prompts (biggest win, biggest lesson, stop/start/continue),
  each autosaving on blur; rate the year (`ScoreStep`); set 1+ goals
  for next year via a nested `GoalForm` (same soft 5-goal-cap nudge as
  regular goal creation, never blocks). Finishing writes
  `Review(type: 'yearly', periodKey: YYYY)`.
- **`GoalForm` gained an optional `defaultYear` prop** — hydration
  falls back to `defaultYear ?? currentYear` when creating a new goal,
  so the yearly review's "add a goal for 2027" affordance pre-fills
  the correct year without forking the form.
- **`GoalsPage`** now renders both review cards right under the page
  header (before the goals list), computing "the reviewed month/year"
  fresh on every render as the actual current month/year — `/goals`
  has no navigable period state the way `/week` does, so unlike the
  weekly review there's no "which period am I reviewing" question to
  answer.

### Key decisions

- **Milestone carry moves the record, it doesn't duplicate it** —
  exactly the same shape as the weekly-priority carry from 5B-i.
  Verified directly in IndexedDB: carrying a milestone changed its
  `month` field from `2026-08` to `2026-09` in place, same `id`, status
  preserved and independently settable afterward. See DECISIONS.md.
- **`resumeStepForMonthly`/`resumeStepForYearly` are coarse, like the
  weekly review's, and for the same reason.** The monthly review's
  audit and next-month-milestone steps aren't backed by any `Review`
  field — a milestone being carried or a new one being added leaves no
  trace on the `Review` record itself, only on `Milestone` rows. So
  resume only distinguishes: nothing recorded → step 1; score set →
  step 3 (skipping straight past the audit step, which is cheap to
  skim since it just shows whatever's left to review). The yearly
  review can do slightly better since the reflection step *does* write
  to `Review.answers` directly: nothing recorded → step 1; any
  reflection field present → step 2; score set → step 3.
- **`ReviewEntryCard` extraction was pure refactor, not new behavior.**
  With a third (soon fourth) review card needing the identical
  title/subtitle/ring/checkmark shape, copy-pasting `WeeklyReviewCard`
  a third time would have meant three places to keep in sync for any
  future visual tweak. `WeeklyReviewCard`'s public interface and
  rendered output are unchanged — confirmed via before/after browser
  screenshots.
- **`defaultYear` on `GoalForm` instead of a forked "next year" form.**
  The only thing the yearly review's goal-creation step needs that the
  regular Goals-page form doesn't is a different starting year — adding
  one optional, backward-compatible prop (falls back to the current
  year exactly as before when omitted) keeps one form, one set of
  validation rules, one soft-cap nudge, instead of two forms drifting
  apart over time.
- **Both new review types target "the current month/year," not a
  navigable one.** `/week` has real prior/next navigation and reviews
  whatever week is on screen; `/goals` has no such state. Rather than
  bolt on month/year navigation just to support the review (which the
  phase spec didn't ask for), both reviews simply operate on
  `new Date()` at render time — recomputed fresh each time `GoalsPage`
  renders, so it's always correct without any extra state to keep in
  sync.

### Known issues / follow-ups

None. Verified in-browser with real goals and milestones: opened the
monthly review, toggled a milestone done, carried another to next
month (confirmed via direct IndexedDB read that `month` moved from
`2026-08` to `2026-09` on the same record, not a duplicate), rated the
month, added a next-month milestone (correctly showed the
just-carried one too), and finished — card updated to show completed.
Opened the yearly review, filled and confirmed all three reflection
fields save independently (verified via `Review.answers` in
IndexedDB), rated the year, created a new 2027 goal from within the
nested `GoalForm` step and confirmed it appeared both in the review
step's own list and in the main Goals list immediately after, and
finished. Reopening both dialogs after completion correctly resumed at
the last step. Re-verified `/today` and `/week` render and their
review cards/dialogs behave identically to before this phase — no
shared files needed behavior changes, only `WeeklyReviewCard`'s
internals were touched, and its rendered output was confirmed
unchanged. Verified both themes at 393px and 1280px. All seeded test
data (goals, milestones, review records) was removed from IndexedDB
after verification. `npm run build` (zero errors) and `npm run test`
(80 tests, 20 new, all green).

## Phase 6A — "Field Log" visual identity overhaul

A full re-skin of shared tokens, typography, the icon set, and the app
shell/nav/capture dialog — deliberately replacing the original "dark
background + one bright accent" identity with a paper-and-ink,
brass-instrument identity grounded in field journals and navigation
instruments (fitting, since the app is literally named Compass). Page
content (Today/Inbox/Week/Goals/Journal internals) was intentionally
left untouched this phase — later phases re-skin those onto this new
foundation. See DECISIONS.md for the full rationale.

### What was built

- **Design tokens** (`tokens.css`) — the entire palette was replaced
  for both themes: "Day — paper" (light) and "Night — chart table"
  (dark). Raw palette tokens are named `--paper`, `--paper-raised`,
  `--paper-elevated` (a new third tone for sheets, needed since the
  spec only specified two surface levels but the app has three),
  `--hairline`, `--ink`, `--ink-soft`, `--ink-faint`, `--brass`,
  `--brass-on`, `--chart-blue`, `--seal`, `--good`. The existing
  *operational* tokens components already consumed (`--bg`,
  `--surface`, `--text`, `--accent`, etc.) were kept and now simply
  alias the new raw tokens (`--bg: var(--paper)`, `--text: var(--ink)`,
  `--accent: var(--brass)`, ...) — this let every component that was
  already written against `bg-bg`/`text-text-muted`/`bg-accent` Tailwind
  classes pick up the new palette automatically, with zero component
  edits needed for the palette swap itself.
- **Typography** — Fraunces (500/600) replaces Space Grotesk for
  display/headings, Karla (400/500) replaces Instrument Sans for
  body/UI, Space Mono (400/700) replaces JetBrains Mono for
  dates/counts/data. All three self-hosted via Fontsource. The existing
  type scale (`text-large-title`, `text-title`, etc.) was kept as-is —
  verified in-browser that Fraunces reads balanced at both the large
  title and card-heading sizes, not oversized or cramped.
- **Icon set** (`icons.tsx`) — every exported icon was redrawn by hand
  in one consistent construction: `currentColor` strokes at
  `strokeWidth: 1.4` (down from 1.75), with exactly one small
  `var(--brass)`-filled accent detail per icon (a dot, a pennant, a
  breather hole — never the whole glyph). The six nav icons match the
  phase spec exactly: a sunrise arc over a horizon for Today, two
  fanned note-cards for Inbox, seven dots for Week, a flag with a
  brass pennant for Goals, a fountain-pen nib with a center slit and
  brass breather hole for Journal, and a 4-dot constellation with a
  brass final dot for Insights. Every other shell/action icon (theme
  toggle, capture plus, check, chevrons, close, lifebuoy, checklist,
  repeat, bookmark, edit, clock, more, trash) was redrawn in the same
  hand.
- **Active/filled nav states** — `NavItem`'s icon type gained an
  optional `active?: boolean` prop; `LeftRail`/`BottomTabBar` now read
  `isActive` from `NavLink`'s render-prop form and pass it through.
  Each nav icon renders a filled/emphasized variant of its own glyph
  when active (e.g. Today's arc gains a translucent fill, Week's dots
  turn solid, Insights' lines thicken) — layered on top of the
  existing active-color change, not a replacement for it.
- **Compass-rose signature** — a small `CompassRoseMark` (thin circle,
  four cardinal tick lines, one brass-filled kite at north) was added
  once, beside the "Compass" wordmark in `LeftRail`. Not reused
  anywhere else in the app.
- **Shell re-skin** — `AppShell`, `LeftRail`, `BottomTabBar`,
  `PageHeader`, `ThemeToggle`, `CaptureButton`, `CaptureDialog`, and
  `Sheet` needed no structural changes at all: they were already
  written entirely against Tailwind's semantic color/font utility
  classes, so the token and font-family swaps above re-skinned them
  automatically. The one direct (non-Tailwind) token reference in the
  whole codebase — `YearGrain.tsx`'s inline `var(--ink)` for the year
  grid's score-intensity fill — was updated to `var(--chart-blue)`,
  since `--ink` now means primary text color, not the old blue accent.
- **Manifest/meta colors** — `index.html`'s `<meta name="theme-color">`,
  `themeStore.ts`'s `THEME_COLOR` map, and `vite.config.ts`'s PWA
  manifest `theme_color`/`background_color` were updated to the new
  paper hex values. These three are the only remaining literal hex
  values outside `tokens.css` — unavoidable, since none of them can
  consume a CSS custom property (a `<meta>` tag and a web manifest need
  static values before any CSS loads).

### Key decisions

- **Old `--ink` (a blue accent used only by `YearGrain`) collided with
  the new spec's `--ink` (primary text color).** The spec's palette was
  followed literally — `--ink` now means text — and the one component
  that used the old meaning was pointed at the new `--chart-blue` token
  instead, which is exactly what that blue was conceptually standing in
  for. This was the only genuine naming conflict found; everything else
  mapped cleanly.
- **Icons keep `stroke="currentColor"` rather than hardcoding
  `var(--ink-soft)`.** Hardcoding a fixed stroke color would break every
  place an icon currently inherits color contextually — the FAB's icon
  against a brass-filled circle, the theme toggle's active/inactive
  pill states, nav active-color changes. `currentColor` preserves all
  of that for free; only the one brass accent per icon is a hardcoded
  token reference, since that accent must stay brass regardless of
  context.
- **`--paper-elevated` is a new token not named in the phase spec.**
  The spec gave two surface tones (paper, paper-raised) but the app has
  three surface levels (page background, cards, sheets/elevated
  overlays) — same as the original `--bg`/`--surface`/
  `--surface-elevated` three-tier structure. Adding one more
  paper-family tone preserves that structure instead of collapsing
  sheets and cards to the same flat tone.
- **Page content (Today/Inbox/Week/Goals/Journal internals) was
  deliberately left untouched**, exactly as scoped. Because every one
  of those components was already written against Tailwind's semantic
  utility classes (never raw hex), the palette and type re-skin
  cascades through them automatically without any file in
  `src/components/today|inbox|week|goals|journal` needing an edit —
  confirmed by browser-checking each page for regressions after the
  shared-token changes landed.

### Known issues / follow-ups

None blocking. Verified in-browser at 393px and 1280px, both themes:
every nav icon renders as the new hand-drawn glyph (confirmed via
direct SVG inspection, not just visual impression) with the correct
active/filled variant when selected; the compass-rose signature renders
once in the rail; the capture dialog, theme toggle, and FAB all pick up
the new palette and icons; zero console errors on any of the six pages.
Grepped the full codebase for raw hex — the only hits are inside
`tokens.css` itself (as intended) and the three unavoidable manifest/
meta-tag duplicates documented above. `npm run build` (zero errors) and
`npm run test` (80 tests, unchanged — this was a visual-only pass, no
test assertions referenced colors or icon internals). A later phase
will re-skin Today/Inbox/Week/Goals/Journal page content onto this new
foundation, per the phase spec.

## Phase 6A-ii — Field Log critique-and-polish pass

Self-critique + polish on the Phase 6A identity, still scoped to shared
tokens/shell/capture-dialog — no page content, no new features.

### Self-critique (written before making changes)

Went through the shell element-by-element asking "does this read as a
deliberate choice for Compass, or the generic default I'd produce for
any app?"

- **Type scale — genuinely generic, and one real bug.** The type scale
  (sizes, line-heights, tracking) was carried over unchanged from the
  Space Grotesk tuning done in the iOS-polish phases. Worse: the
  large-title style declares `fontWeight: 700`, but only Fraunces
  500/600 are self-hosted — the browser was silently fake-bolding
  (synthesizing) 600 into 700 the whole time, which looks slightly
  fuzzy/off on real displays. The negative letter-spacing tuned for a
  tight geometric sans (-0.02em/-0.01em) works against a serif's
  natural, more open rhythm at display sizes. This is the clearest
  "shipped without checking" finding in the whole pass. **Fixed.**
- **Contrast — the single most important finding.** `--ink-soft` and
  `--ink-faint` were ported from the old palette's "muted secondary/
  tertiary" formula without recomputing against the new, much lighter
  paper tones. Measured: light-theme `--ink-soft` on `--paper` was
  4.40:1 (fails AA), `--ink-faint` was 2.83–3.18:1 (fails badly);
  dark-theme `--ink-faint` was 3.45–3.79:1 (fails). These tokens are
  used for real body/label text throughout the app (breadcrumbs, "When"/
  "Goal" field labels, empty-state copy, strikethrough completed items),
  not just decoration. This is a usability defect the visual-only Phase
  6A pass didn't catch because it never measured. **Fixed — see
  DECISIONS.md for exact before/after ratios.**
- **Icon set — mostly solid, optically uneven at true size.** The
  six nav glyphs are genuinely specific to Compass (sunrise arc, fanned
  cards, pennant flag, pen nib, constellation) — not generic Tabler-style
  defaults. But at true 16–24px render size, a uniform `strokeWidth:1.4`
  applied to every glyph regardless of shape density made sparser icons
  (Goals' single pole, Week's thin dot row) read visibly lighter than
  denser ones (Inbox's stacked cards, Journal's nib). Goals' pole was
  also mathematically but not optically centered — its mass sat in the
  upper-left of the box. **Fixed** — see Part 3 changes below.
- **Compass rose — the one place to be bold, initially under-committed.**
  Checked in its real position next to the wordmark rather than in
  isolation: at the size it shipped at, it read as a small decoration
  bolted on next to the text rather than a genuine signature mark.
  Since the brief explicitly asks for boldness in exactly this one
  place, it was worth a second pass rather than leaving it timid.
  **Adjusted** — see Part 6 below.
- **Focus states — a real gap, not a style choice.** None of the shell's
  interactive elements (rail links, tab bar links, theme toggle buttons,
  capture FAB) had any deliberate `:focus-visible` treatment — they were
  relying on whatever the browser's default outline happens to render,
  which is inconsistent across browsers and doesn't match the brass
  identity at all. This is a "we'll get to it" gap, not a considered
  omission. **Fixed** — added an on-brand brass focus ring.
- **What was already fine:** the token architecture itself (raw
  palette tokens aliased through to the existing operational names),
  the icon *concepts* (all six read as specific to a field-log/compass
  app, not swappable defaults), and the overall restraint of the
  palette (brass used only for the one accent per icon, never for body
  text) all held up under scrutiny without changes.

### What changed

- **Contrast fixes (`tokens.css`)** — `--ink-soft` and `--ink-faint`
  retuned in both themes to clear AA (4.5:1) against both surface
  tokens, with a small safety margin. See DECISIONS.md for the exact
  measured ratios before and after. `--ink` (primary text) needed no
  change — it already cleared 11:1+ in both themes.
- **Type scale retuning (`tailwind.config.js`)** — `large-title`'s
  `fontWeight` corrected from the non-existent 700 to 600 (the heaviest
  weight actually loaded), removing the silent fake-bold. Letter-spacing
  loosened toward neutral at both display sizes (`large-title`
  -0.02em → 0em, `title` -0.01em → 0em) since Fraunces reads more
  elegant with open tracking than a tight geometric sans does.
  Line-height opened slightly at all three Fraunces-rendered sizes
  (`large-title` 1.15 → 1.2, `title` 1.25 → 1.3, `headline` 1.4 → 1.42)
  to give Fraunces' taller x-height and more expressive
  ascenders/descenders room to breathe. Karla's body sizes got a small
  matching bump (`subhead` 1.45 → 1.5, `caption` 1.4 → 1.45,
  `caption-2` 1.3 → 1.35) since Karla's x-height runs slightly taller
  than Instrument Sans' at the same point size.
- **Icon optical-balance pass (`icons.tsx`)** — base `strokeWidth`
  raised from 1.4 to 1.5 (still within the 1.2–1.6 range from the
  original brief) for a slightly more confident, consistent line at
  true render size. `IconWeek`'s seven dots recomputed to a symmetric
  spread with a touch more radius. `IconGoals`' pole recentered from
  x=6 to x=9 with the pennant redrawn off it, so the glyph's visual
  mass sits closer to the box's optical center instead of pinned to
  the upper-left corner.
- **Focus-visible treatment** — `LeftRail` nav links, `BottomTabBar`
  nav links, `ThemeToggle` buttons, and `CaptureButton` all gained a
  consistent `focus-visible:ring-2 focus-visible:ring-accent-ring`
  treatment (brass-tinted, matching the identity) in place of relying
  on browser defaults.
- **Compass rose adjustment** — checked in its real position beside the
  wordmark (not in isolation) and it read exactly as the self-critique
  predicted: a tiny, muted afterthought. Two real issues, not just
  taste: (1) it was sized at `h-5 w-5` (20px) next to `text-title`
  Fraunces text, disappearing next to the bolder serif; (2) it used
  `text-text-faint` (`--ink-faint`) instead of the `--ink-soft` the
  original brief actually specified — a genuine implementation miss in
  Phase 6A, not a deliberate choice. Fixed: sized up to `h-6 w-6`,
  stroke weight 1.1 → 1.4, corrected to `text-text-muted`
  (`--ink-soft`). Re-checked at 3x scale next to the real wordmark
  size — now reads as a considered signature, not a smudge.

### Contrast measurements (WCAG AA, 4.5:1 threshold)

Measured with the WCAG relative-luminance formula, `--ink`/`--ink-soft`/
`--ink-faint` against both surface tokens, in both themes:

| Token | Theme | vs `--paper` | vs `--paper-raised` | Before → After |
|---|---|---|---|---|
| `--ink` | light | 11.03:1 | 12.41:1 | unchanged (already passed) |
| `--ink` | dark | 13.34:1 | 12.14:1 | unchanged (already passed) |
| `--ink-soft` | light | 4.40:1 → **5.54:1** | 4.95:1 → **6.24:1** | `#6b6656` → `#5b5749` |
| `--ink-soft` | dark | 5.84:1 | 5.32:1 | unchanged (already passed) |
| `--ink-faint` | light | 2.83:1 → **4.63:1** | 3.18:1 → **5.20:1** | `#8a8574` → `#68634d` |
| `--ink-faint` | dark | 3.79:1 → **5.04:1** | 3.45:1 → **4.59:1** | `#7a7666` → `#948f7b` |

Every tier now clears 4.5:1 against both surfaces in both themes, with
a small safety margin. The unavoidable cost: light-theme `--ink-soft`
and `--ink-faint` are now much closer together in lightness than
before (`#5b5749` vs `#68634d`) — `--paper`'s high luminance (0.755)
leaves very little headroom for a third, lighter AA-passing tier. This
is a real trade-off, not an oversight: three genuinely distinct,
AA-compliant text tiers on a paper this light isn't achievable, and
per the phase brief, correctness won the trade against preserving a
wider visual gap.

### Known issues / follow-ups

None blocking. Verified in-browser, both themes, 393px and 1280px:
every nav icon renders with the rebalanced stroke weight and the
recentered Goals glyph; the compass rose reads clearly at its real
size next to the wordmark; focus-visible rings appear correctly on
rail links, tab bar links, theme toggle buttons, and the capture FAB
when tabbing; the daily MIT cap's "Three is enough for today." and the
weekly priority cap's "Three is enough for one week." copy are
unchanged in source and now render in the AA-compliant
`--ink-soft`; the "Stuck?" pill opens its calm overlay correctly; the
habit week-strip and `/week` task columns remain legible against the
new palette. `npm run build` (zero errors) and `npm run test` (80
tests, all green — this was a tokens/type/icon-only pass, no test
assertions touch colors or icon internals).

## Phase 6B — Retuning /today and /inbox onto Field Log

### Self-critique (written before making changes)

Went through every Today/Inbox component asking "does this feel
deliberately retuned for Fraunces/Karla/Space Mono and the ink/paper/
brass palette, or is it just wearing the new tokens on old bones?"

- **Habit week-strip squares — a real pass/fail bug.** Measured the
  three states' actual rendered colors: "skipped" (`--skip-fill`) and
  "empty" (`--grid-empty`) blend to `#d4cfc1` and `#d8d2c4` in light
  theme — a contrast ratio of **1.04:1** between them, i.e.
  indistinguishable at a glance. This is the app's single most-tapped
  control and it currently can't reliably tell skip from empty apart.
  Inherited from the old dark palette's opacity values, never
  recalibrated. **Fixed** — see below.
- **Year Grain — the same class of bug the phase brief predicted.**
  The intensity formula (`0.28 + (score-1)*0.18`) was tuned for the old
  dark palette. Measured against the new light paper: a score-1 cell
  blends to a contrast of only **1.52:1** against paper and **1.32:1**
  against an empty cell — a whole year of low-scoring days would look
  indistinguishable from days with no review at all. **Fixed.**
- **Brass as literal text color — fails AA in light theme, and this
  is bigger than habit squares.** Checked every `text-accent` usage
  reachable from Today/Inbox (chip-selected labels, "Right now"
  heading, the Stuck pill) against its actual rendered background.
  Brass (`#a8823c`) tops out at **2.45–3.06:1** against paper/wash in
  light theme — it never reaches 4.5:1 as a text color on this palette,
  no matter how the wash opacity is tuned (even 0% wash, i.e. plain
  paper, only gets to 2.72:1). This is a real, shipped-since-6A defect,
  not a Today/Inbox-specific one — the identical `bg-accent-wash
  text-accent` pattern also appears in Week/Goals/Journal, which are
  out of this phase's scope. **Fixed within Today/Inbox** by adding a
  dedicated `--accent-text` token (a darker, AA-safe brass used only
  where brass renders as literal text); **flagged below** as known debt
  for whichever phase retunes Week/Goals/Journal next, so the same
  fix should be applied there too rather than rediscovered.
- **Brass button-fill text also fails AA in light theme.** Every
  `bg-accent text-accent-on` button ("Save", "Add", "Finish", "Start 2
  min", etc.) measured at only **3.26:1** in light theme — the near-
  white `--accent-on` doesn't have enough contrast against brass's
  mid-range luminance. This is a shared token (`--accent-on`), used
  identically everywhere, so the fix necessarily applies app-wide —
  same precedent as 6A-ii's `--ink-soft`/`--ink-faint` fix. **Fixed.**
- **Spacing — a smaller, real issue, not urgent.** `TodayFocus`/
  `TodayHabits`' heading-to-card gap (`mt-3`) was inherited from the
  Space Grotesk tuning; Fraunces titles read slightly heavier/taller at
  the same size, and the gap felt a touch tight in-browser. **Fixed**
  with a modest bump (`mt-3` → `mt-4`), not a wholesale rework — most
  of the page's rhythm (section-to-section `mt-8`, card internal
  padding) already reads fine and didn't need touching.
- **What was already fine:** `RightNowCard`, `FocusMode`,
  `StuckOverlay`, `FocusTimer`, `BreathingMoment`, the evening review's
  `ScoreStep`/step chrome, `InboxRow`, and `ProcessSheet`'s tile icons
  all consume Tailwind semantic classes exclusively (no raw hex, no
  leftover generic icons — `ProcessSheet`'s four tiles already use the
  6A hand-drawn `IconChecklist`/`IconRepeat`/`IconJournal`/
  `IconBookmark`) and read as a coherent part of the same material
  world once the token fixes above landed. No structural changes
  needed to any of these.

### What changed

- **`--skip-fill`** — opacity raised in both themes (light: 0.1 → 0.4,
  dark: 0.14 → 0.45) so "skipped" reads as a clearly present, muted
  block instead of nearly vanishing into "empty."
- **Year Grain intensity formula** — floor raised from 0.28 to 0.5
  (`0.5 + (score-1)*0.125`), so even a score-1 day reads as visibly
  filled against the new paper background; score-5 still renders at
  full `--chart-blue` saturation.
- **`--accent-on`** (light theme only) — corrected from a near-white
  (`#f8f5ee`) to a near-black (`#1e1c17`) so brass-filled buttons pass
  AA. Dark theme's `--accent-on` was already correct (near-black on
  bright brass, 7.83:1) and is unchanged.
- **New `--accent-text` token** — a darker, AA-safe brass
  (`#654e24` light, same as `--accent` in dark since it already
  passes) for the specific case of brass rendering as literal text:
  `RightNowCard`'s heading, the Stuck pill's label, and the
  goal-chip-selected label in `TaskConvertForm`/`HabitConvertForm`/
  `TodayHabits`' add-habit form. `--accent` itself is untouched and
  still used for fills, borders, and icon accents.
- **Spacing** — `TodayFocus`/`TodayHabits` heading-to-card gap
  loosened (`mt-3` → `mt-4`).

### Known issues / follow-ups

**The `--accent-text` fix needs to be applied to Week/Goals/Journal
too.** The identical `bg-accent-wash text-accent` chip pattern (and
plain `text-accent` labels like "+ New goal") exists in
`WeekPriorities.tsx`, `TaskEditForm.tsx`, `GoalCard.tsx`,
`JournalCalendar.tsx`, `JournalEditor.tsx`, `GoalsPage.tsx`,
`YearlyReviewDialog.tsx`, and `MonthlyReviewDialog.tsx` — all outside
this phase's Today/Inbox scope, all with the same AA failure in light
theme. Recorded here so it's fixed deliberately in whichever phase
retunes those pages next, rather than rediscovered from scratch.

### Contrast measurements (WCAG AA, 4.5:1 threshold unless noted)

| Pairing | Theme | Before | After |
|---|---|---|---|
| `--accent-on` text on `--accent` fill (buttons: Save/Add/Finish/Start) | light | 3.26:1 (fail) | **4.80:1** |
| `--accent-on` text on `--accent` fill | dark | 7.83:1 (already passed, unchanged) | 7.83:1 |
| `--accent-text` on accent-wash-over-paper (chip-selected labels, "Right now", Stuck pill) | light | 2.45:1 (fail) | **5.10:1** |
| `--accent-text` on accent-wash-over-paper | dark | 5.80:1 (already passed, unchanged) | 5.80:1 |
| "skipped" vs "empty" habit square | light | 1.04:1 (indistinguishable) | **1.92:1** |
| "skipped" vs "empty" habit square | dark | 1.12:1 (indistinguishable) | **2.90:1** |
| Year Grain score-1 cell vs paper | light | 1.52:1 | **2.22:1** |
| Year Grain score-1 cell vs empty cell | light | 1.32:1 | **1.93:1** |

The habit-square and Year-Grain numbers are non-text UI-component
contrast (WCAG 1.4.11's 3:1 guideline for meaningful graphical states),
not text contrast — full separation was weighed against the product's
explicit "skipped is neutral, not punitive" design law (see CLAUDE.md):
pushing "skipped" to a much higher contrast would make it read as a
harsh warning color rather than a calm, neutral state. The chosen
values are a deliberate middle point — a large, clearly-perceptible
jump from "nearly invisible" to "clearly told apart," without making
the neutral state visually loud.

### Verification

Seeded real data via the `/dev` route (habits with a full week of
done/skipped/empty logs, tasks, an inbox capture) plus five manually
seeded daily `Review` rows (scores 1–5) to exercise the Year Grain's
full range. Confirmed in-browser, both themes, 393px and 1280px:

- Habit squares: done/skipped/empty are now clearly three distinct
  visual states at true render size (confirmed via screenshot in both
  themes, not just computed contrast math).
- Year Grain: `intensityForScore`'s computed opacities verified via
  `getComputedStyle` match the new formula exactly (0.5/0.625/0.75/
  0.875/1.0 for scores 1–5).
- `RightNowCard`'s heading and the Stuck pill's label render in the new
  `#654e24` (light) / unchanged brass (dark) — confirmed via
  `getComputedStyle`, not just visual impression.
- The brass "Save"/date-chip-selected button text renders in the new
  `#1e1c17` (light) / unchanged `#1b1b17` (dark) — confirmed via
  `getComputedStyle`.
- `ProcessSheet`'s four tiles render with the correct 6A hand-drawn
  icons (`IconChecklist`/`IconRepeat`/`IconJournal`/`IconBookmark`).
- The max-3-MIT and max-5-habit calm blocking copy ("Three is enough
  for today."/"Five is plenty for now.") is unchanged in source —
  confirmed via `grep`, not just assumed.
- All seeded test data (habits, tasks, captures, the 5 manual daily
  reviews) removed from IndexedDB via the `/dev` route's wipe action
  after verification.

`npm run build` (zero errors) and `npm run test` (80 tests, all green
— this was a visual/token-tuning pass; no test assertions reference
colors or spacing).
