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

## Rule enforcement lives in the repo layer, not the UI

`src/db/rules.ts` exports `canActivateHabit()`, `canAddMIT(date)`, and
`canAddWeeklyPriority(weekOf)`. The repos that create/activate the relevant
records (`habits.create`/`habits.setStatus`, `tasks.create`/`tasks.update`,
`weeklyPriorities.create`) call these and throw `RuleViolationError` if
violated, so the limits (max 5 active habits, max 3 MITs/day, max 3 weekly
priorities) hold regardless of which UI eventually calls the repo. UI layers
built later should catch `RuleViolationError` for user-facing messaging, not
re-implement the counting logic.
