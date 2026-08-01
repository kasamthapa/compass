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

## Rule enforcement lives in the repo layer, not the UI

`src/db/rules.ts` exports `canActivateHabit()`, `canAddMIT(date)`, and
`canAddWeeklyPriority(weekOf)`. The repos that create/activate the relevant
records (`habits.create`/`habits.setStatus`, `tasks.create`/`tasks.update`,
`weeklyPriorities.create`) call these and throw `RuleViolationError` if
violated, so the limits (max 5 active habits, max 3 MITs/day, max 3 weekly
priorities) hold regardless of which UI eventually calls the repo. UI layers
built later should catch `RuleViolationError` for user-facing messaging, not
re-implement the counting logic.
