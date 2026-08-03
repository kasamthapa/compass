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
