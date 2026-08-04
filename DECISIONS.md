# Decisions

Standing architectural/product decisions that aren't obvious from the code
alone. Update this file when a new phase makes a call worth remembering.

## Weeks start on Monday

`weekOf(date)` in [src/lib/dates.ts](src/lib/dates.ts) returns the Monday of
the week containing `date`. Every `weekOf`-keyed record (`WeeklyPriority`,
and any future weekly aggregation) uses that Monday date string as its key.
This is a fixed convention — do not introduce a Sunday-start code path
elsewhere; if the product ever needs a configurable week start, that's a
deliberate future change, not an accidental inconsistency.

## Year grain is a Monday-first GitHub-style grid

`YearGrain` (`src/components/today/YearGrain.tsx`) lays out weeks as columns
of 7 rows, Monday through Sunday — not Sunday-first like GitHub's own
contribution graph. This keeps it consistent with `weekOf()` (Monday is the
week start everywhere else in the app); introducing a Sunday-first grid just
for this one widget would be a silent inconsistency with no product reason
behind it.

## Boolean fields are never Dexie indexes

IndexedDB has no valid "boolean" key type (per the IndexedDB spec, valid keys
are number, string, Date, binary, and Array — not boolean). A Dexie index
declared on a boolean-valued property silently never matches: the record is
just omitted from that index by the browser, with no error thrown, so
`.where('someBoolean').equals(true)` always returns nothing.

Two model fields are booleans: `CaptureItem.processed` and `Task.isMIT`.
Neither is included in the `db.version(1).stores()` schema in
[src/db/db.ts](src/db/db.ts). Instead:

- `captures.getUnprocessed()` does a client-side `.filter()` over the whole
  `captures` table (fine — a personal capture inbox stays small).
- `tasks.getMITsForDate(date)` uses the indexed `date` lookup to narrow to
  one day's tasks first, then filters `isMIT` client-side over that much
  smaller result set.

If a boolean field ever needs true indexed lookups at larger scale, the fix
is to store it as `0`/`1` at the Dexie layer (still typed as `boolean` in
`src/types/models.ts`, since that's the tracked contract) — not to index the
boolean directly.

## Soft delete

Every table's mutation goes through the repo layer, which sets `deletedAt`
instead of removing rows. Every repo read filters `!record.deletedAt`.
Nothing outside `src/db/repo/*.ts` should ever call `.delete()` on a Dexie
table directly (the dev-only `wipeAllData()` in `src/db/seed.ts` is the one
intentional exception — it hard-clears every table for local dev resets).

## Focus Mode and the Stuck overlay share one timer, not two

`src/components/FocusTimer.tsx` is a single presentation-only countdown
(start/pause/reset/add-5-min) used by both `FocusMode` (2 or 25 min) and
`StuckOverlay` (always 2 min). It renders no wrapper layout of its own — the
caller supplies the centering/growth context (`FullScreenOverlay`'s flex-1
column for Focus Mode, the `Sheet`'s normal flow for the Stuck overlay) — so
the same timer works full-screen and inside a bounded sheet without a
"compact mode" prop. Nothing the timer does is persisted or logged; it is
deliberately not a time-tracking feature (see CLAUDE.md's ADHD-support
intent — this is a starting aid, not surveillance).

## Focus Mode is a full-bleed overlay; the Stuck overlay is a Sheet

Two different presentations, on purpose. Focus Mode's whole point is to
blot out everything else on the page — a new `FullScreenOverlay` component
(fade only, `bg-bg`, `z-50`) — while the Stuck overlay is described in the
phase prompt as "minimal," which the existing bounded `Sheet` (bottom sheet
on mobile, centered modal on desktop, `z-40`) already conveys better than a
full takeover would. Using `Sheet` for Stuck also means it automatically
sits *below* Focus Mode in stacking order, which never matters in practice
(they're mutually exclusive entry points) but is a reasonable default.

## `pickNextAction` is the single source of truth for "what's next"

`src/lib/nextAction.ts` — first incomplete MIT (by `createdAt` order), else
first incomplete non-MIT task, else `null`. Both Focus Mode and the Stuck
overlay call this same pure function rather than each re-deriving "the next
thing" their own way, so the two surfaces never disagree about which task
is the priority. It's a plain function (not a repo query) because it
operates on an already-fetched task list — no reason to touch Dexie twice
for the same day's tasks.

## Someday is a flag, not a terminal "processed" state

`CaptureItem.someday?: boolean` is a separate field from `processed`. A
someday item stays `processed: false` — it's parked, not converted to
anything, and (unlike a genuinely processed item) could still be picked up
later and turned into a task/habit/note through the exact same processing
panel. `getUnprocessed()` excludes it from the main inbox; `getSomeday()`
is the dedicated query for the "Someday / maybe" section. This is a
deliberate departure from the model's existing `convertedTo.type:
'someday'` union member (still present, now effectively unused) — that
shape would have meant marking someday items `processed: true`, which
reads as a one-way door and would make "reconsider this later" awkward.

## Habit creation can bypass the active-habit cap for a specific status

`habits.create()` accepts an optional `status` (defaults to `'active'`);
the 5-active-habit cap check only runs when the resulting status is
`'active'`. This exists so the inbox's habit-conversion form can offer a
calm "save as paused" escape valve when the cap is already hit, instead of
blocking the conversion outright or silently discarding the capture. Every
other caller is unaffected — passing no `status` behaves exactly as
before.

## Rule enforcement lives in the repo layer, not the UI

`src/db/rules.ts` exports `canActivateHabit()`, `canAddMIT(date)`, and
`canAddWeeklyPriority(weekOf)`. The repos that create/activate the relevant
records (`habits.create`/`habits.setStatus`, `tasks.create`/`tasks.update`,
`weeklyPriorities.create`) call these and throw `RuleViolationError` if
violated, so the limits (max 5 active habits, max 3 MITs/day, max 3 weekly
priorities) hold regardless of which UI eventually calls the repo. UI layers
built later should catch `RuleViolationError` for user-facing messaging, not
re-implement the counting logic.

## Goals' 5-active cap is soft — a different pattern from the hard caps above

`rules.isAtGoalSoftCap()` returns a plain `boolean` and never throws, unlike
every other limit in `rules.ts`. `goalsRepo.create()` has no cap check at
all — the 5-goal limit is purely advisory, per the Phase 4A spec ("do NOT
hard-block... still let me save if I choose to"). `GoalForm.tsx` calls
`isAtGoalSoftCap()` itself (via a live query on `getActive()`) and renders a
calm nudge ("Focus beats breadth...") when at/over the cap, but the Save
button stays fully functional either way. Do not "fix" this into a
`RuleViolationError` — habits/MITs/weekly-priorities are product law that
must hold no matter which caller invokes the repo; goals are deliberately
not that, since the cap only needs to matter at the one point of friction
(creating a new goal), not as a database-level invariant.

## `weekNumber()` is a pragmatic counter, not ISO-8601 week numbering

`src/lib/dates.ts`'s `weekNumber(weekOf)` counts Mondays from Jan 1 of that
year up to and including the given week's Monday. It is NOT ISO-8601 week
numbering, which has its own (fiddly) rule about which year a boundary week
belongs to based on where the first Thursday falls. This app has no need to
interoperate with any external calendar system that expects ISO week
numbers — the Week view's header just needs a stable, locally-consistent
"week N" label that increments by exactly 1 per week. If a future phase ever
needs true ISO-8601 numbers (e.g. syncing with an external calendar), that's
a deliberate new function, not a fix to this one.

## Week view's mobile/desktop split is one responsive component, not two

`WeekGrid.tsx` renders both the phone-sized "vertical list of day sections"
and the desktop "7 side-by-side columns" layouts described in the Phase 4B
prompt from a single `grid-cols-1 md:grid-cols-7` grid, not two separate
components. The only real behavioral difference between the two is that
desktop additionally supports drag-and-drop between columns — everything
else (task rows, the tap-to-edit interaction, empty-day state) is identical
markup at every breakpoint, so splitting it would just duplicate that logic
for a layout change CSS already handles.

## Weekly priorities use the hard-cap `RuleViolationError` pattern, not goals' soft nudge

`weeklyPriorities.create()`'s existing `canAddWeeklyPriority` check (from
Phase 1) is unchanged and still throws. This is a deliberate contrast with
Goals' `isAtGoalSoftCap` (above): the Phase 4B prompt explicitly called
weekly priorities "a weekly cognitive-load limit, closer to MITs than to
goals," so the Week view's add-priority UI proactively hides the
affordance at 3 (mirroring `TodayFocus`'s MIT-cap treatment) rather than
letting the user push past it like Goals does. When adding a new capped
resource, check which of these two shapes the product intent actually
matches before picking the pattern — the two hard/soft variants are meant
to coexist, not converge.

## "Carry to next week" moves a WeeklyPriority record; it doesn't duplicate it

Carrying a priority forward (`WeekPriorities.tsx`) updates the existing
record's `weekOf` to `+7 days` rather than creating a new record in the
next week and marking the old one some kind of "carried" status.
`WeeklyPriority.status` only has `'active' | 'done' | 'dropped'` — adding a
fourth status, or duplicating the row, would create a second source of
truth for what is really just "this priority now belongs to a different
week." The one guard: carrying still checks `canAddWeeklyPriority` on the
destination week first, and shows a calm inline note instead of silently
pushing that week over its cap.

## The wide content column is the AppShell default; narrow reading-width is per-element, not per-page

`AppShell.tsx`'s `<main>` always uses `max-w-content-wide` (1400px) — every
route shares one column width, with no per-route branching. This reverses
an earlier, narrower fix that gave `/week` alone a wide column while
Today/Inbox/Goals kept the old 720px page width: that was flagged as an
inconsistency (misaligned edges and an oddly-positioned `ThemeToggle`
between pages), and the real fix is a single shared default rather than
each new route remembering to opt in.

The old 720px value didn't disappear — `--content-max-width` still exists,
now documented as the comfortable-reading-width token, applied locally to
individual freeform-text elements (a goal's `why` line, a capture's text)
rather than to the page. This keeps the distinction explicit: structural
elements (cards, rows, headers) always use the full wide column; only
prose-shaped text caps its own width so a single long sentence doesn't
stretch edge-to-edge. Short captions/labels (habit cue, task first-move)
are deliberately left uncapped — they never grow long enough in practice
for this to matter, and capping them would just be inert noise.

## Journal entry hydration is a one-shot fetch, not a live query

`JournalEditor.tsx` loads a day's entry with a plain `journalRepo.getForDate`
call inside a `useEffect` keyed on `[date]`, not `useLiveQuery`. A live
query would re-fire on every write to `journalEntries` — including the
component's own debounced autosave — which creates two problems at once:
it can't distinguish "still loading" from "confirmed no entry yet" (both
render as `undefined` on a freshly-selected date), and without extra
guarding it would re-hydrate local state mid-typing from a query that just
reacted to the save the user's own keystrokes triggered. `EveningReviewDialog`
solved the analogous problem by keying its resume effect on `isOpen` rather
than on live review data (see its comment); this is the same fix shape
applied to whichever `date` is currently selected. A one-shot fetch per
date sidesteps both issues: it hydrates exactly once when the selected day
changes and is structurally incapable of reacting to the component's own
writes.

## The debounced-save flush lives in refs, and its correctness is tested at the repo layer

`JournalEditor`'s pending-save timer, latest-typed text, and current date
are held in refs (`saveTimerRef`, `textRef`, `dateRef`), not component
state — the flush function and the effect cleanup that calls it both need
whatever value is *current* at the moment they run, not a value captured
in a stale render closure. Flushing itself relies on a specific, load-bearing
React guarantee: when an effect's dependency changes, React runs that
effect's cleanup *before* running the next effect body, so returning
`() => void flushPendingSave()` from the `[date]`-keyed hydration effect
guarantees the outgoing day's last edit is written before the incoming
day's entry is loaded — and the same cleanup fires on unmount, covering
navigating away entirely.

This codebase's test stack (Vitest + `fake-indexeddb`, no React Testing
Library or fake timers) can't drive that timing directly, so "no data loss
on rapid day-switching" is verified two ways: `journal.test.ts` asserts the
repo-level guarantee this behavior depends on (`upsertForDate` calls for
two different dates in quick succession never cross-contaminate their
text), and the actual UI timing was verified manually in-browser (type,
switch days before the 800ms debounce fires, read IndexedDB directly to
confirm both dates hold the right content). If this project ever adds a
DOM-level test harness, the manual pass should be converted to an
automated one — until then, don't treat the repo-level test alone as full
coverage of the flush behavior.

## Journal is entry-first; the calendar is a secondary "History" affordance

`JournalPage` lands directly on today's entry — the calendar (formerly the
inline top-of-page component) now lives behind a "History" button in the
header, opened as a `Sheet`. This was a deliberate reversal of the initial
Phase 5A layout (calendar-first, entry below the fold), based on the
observation that a calendar-first landing page makes browsing history the
default action and today's blank page a secondary one, which works against
actually building a daily-journaling habit — the thing worth optimizing for
is friction-free access to *today*, not month browsing. This is the same
Today-first shape already used everywhere else in the app: Today, Week, and
Goals all lead with "what matters right now," with historical/list views
(Goals' Archived section, Week's date nav) always a step behind the
primary view, never the landing state. Any future page with a similar
"current thing vs. browsable history" split should default to the same
shape rather than re-deriving it.

One consequence worth remembering: Journal's header replaces `ThemeToggle`
with the History button in that trailing slot, rather than showing both.
Every other page's header is one title + one trailing control; Journal
just has a more useful thing to put there. Theme is a global preference
(not per-page), so it's still one tap away on any other page — nothing is
actually lost.
