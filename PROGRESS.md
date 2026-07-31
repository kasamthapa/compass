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
