# Compass

A personal, local-first PWA that combines a habit tracker, daily planner,
journal, and goal cascade into one calm system.

## Why

Compass exists to connect daily actions to long-term goals for a brain that
gets distracted — the system is meant to carry the load, not willpower.
Flexible habits instead of punishing streaks, a hard cap on how much you can
pile onto one day, and a 2-minute evening review that closes the loop: the
goal is a tool that stays calm and useful even on the days you're not.

It's a single-user app, built for one person's laptop and phone, fully
functional offline.

## Screenshots

_Coming soon — drop images into [`docs/`](docs)._

| Today (dark)                                       | Today (light)                                        |
| -------------------------------------------------- | ---------------------------------------------------- |
| ![Today screen, dark theme](./docs/today-dark.png) | ![Today screen, light theme](./docs/today-light.png) |

## Features

What's actually built so far:

- **Today screen** — the daily home of the app:
  - **MITs ("Most Important Tasks")**, capped at 3 per day. No error
    messages when you hit the cap — the input just quietly becomes "Three
    is enough for today."
  - **Flexible habit tracking**: up to 5 active habits, each with an
    X-of-7-per-week target instead of an all-or-nothing streak. Missing a
    day doesn't reset anything — "skipped" is a neutral, non-judgmental
    state, not a broken streak.
  - **Year contribution grid**, GitHub-style: a quiet glance at completed
    daily reviews across the whole year, colored by that day's review
    score.
  - **Guided evening review**: a 4-step, ~2-minute daily check-in (how the
    day went, one win, one lesson, tomorrow's focus) that autosaves as you
    go and resumes if you close it partway through.
  - **"Right now" focus mode**: a full-screen view that shows exactly one
    task — its title and an optional tiny "first move" — with a 2 or
    25-minute timer to start it. No list, no decision fatigue.
  - **"I'm stuck" overlay**: an always-reachable, gentle escape hatch for
    frozen days. Shows one tiny next action (never the whole task list),
    warm non-judgmental copy, a 2-minute timer, or a 60-second breathing
    moment. No streaks, no stats, no pressure.
  - **Optional "first move" and time estimate on tasks**: an absurdly
    small physical starting action (e.g. "open the doc") and a rough
    `~min` estimate, both off by default behind a quiet "+" affordance —
    never required fields.
- **Inbox** — the frictionless capture-and-process screen:
  - A calm list of unprocessed captures, newest first, with a quiet
    unprocessed-count badge on the Inbox tab (hidden when empty).
  - **Four ways to turn a thought into something real**: a task (with
    date quick-chips, an MIT toggle, optional goal link), a habit, a
    journal note, or "someday" — parked in a collapsible section instead
    of cluttering the main list. Plus edit and (soft) delete.
  - **Keyboard-driven triage** on desktop: `j`/`k` to move through the
    list, `t`/`h`/`e` to jump straight into the task/habit/edit form for
    the selected item, `n`/`s`/Backspace to note/someday/delete it
    instantly — no dialog in the way.
  - A genuinely calm "Inbox zero. Nothing to sort." when there's nothing
    left to process.
- **Goals** — the year → month cascade:
  - Active yearly goals as inset-grouped cards: title, an italic "why"
    identity line, and a live progress % from linked milestones. Tap to
    expand in place and see milestones grouped by month, each a quiet
    row that toggles active → done with a subtle strikethrough (never a
    harsh color).
  - **Soft 5-goal cap**: at the 5th active goal, a calm nudge ("Focus
    beats breadth — consider finishing or pausing one first") — never a
    block. You can always save anyway.
  - Add a milestone inline within an expanded goal card, same
    lightweight pattern as the Today/Inbox task forms.
  - A quiet "⋯" menu per goal for Edit, Mark achieved, or Mark dropped —
    archived goals collapse into an "Archived (N)" section out of the
    way.
  - Optional goal-link chips on the habit create forms (Today and
    Inbox's habit conversion) — fully optional, never required.
  - **Monthly review**: a quiet 3-step check-in — audit this month's
    milestones across every active goal (done / carry to next month /
    drop, the same carry-not-duplicate pattern as weekly priorities),
    rate the month 1–5, and optionally add a milestone for next month
    per goal. Always reachable, never scolds if skipped; a quiet ring
    highlights it from the last 3 days of the month through the 3rd of
    the next.
  - **Yearly review**: a quiet 3-step check-in — reflect on the year
    (biggest win, biggest lesson, stop/start/continue), rate the year
    1–5, and set 1 or more goals for next year (same form, same soft
    5-goal cap as regular goal creation). A quiet ring highlights it
    from December 20 through January 10.
  - Both reuse the same step-dialog engine as the daily and weekly
    reviews, so they autosave and resume correctly if closed partway
    through, ending with the same calm completion moment.
- **Week** — the priorities-and-schedule view at `/week`:
  - Header with the week's date range and a week number ("AUG 3–9 ·
    WEEK 32"), `<` `>` controls to navigate weeks, defaulting to the
    current week on load.
  - **Up to 3 weekly priorities**, hard-capped like MITs (a calm
    blocking note, "Three is enough for one week," replaces the add
    affordance at the cap — no override). Each priority can optionally
    link to a goal, shown as a quiet mono breadcrumb ("→ Ship a side
    project"); a tap-to-toggle circle marks one done, and a quiet
    overflow menu carries a priority to next week or drops it.
  - **Week grid** of that week's tasks: 7 side-by-side day columns on
    desktop with native drag-and-drop to reschedule between days;
    a stacked vertical list of day sections on mobile. Tasks show a
    small amber dot when they're an MIT and a tiny glyph when linked to
    a goal or weekly priority.
  - Tapping any task (either layout) opens a shared edit sheet — title,
    a Today/Tomorrow quick-chip plus a day-of-week picker for the
    visible week, the MIT toggle, an optional first-move note, and
    optional goal/weekly-priority links.
  - **Weekly review**: a 5-step guided check-in for the viewed week —
    clear the inbox (the same Task/Habit/Note/Someday actions as
    Inbox itself), act on this week's priorities (done/carry/drop),
    a short reflective check-in per active goal, rate the week 1–5,
    and set up to 3 priorities for next week. Always reachable, never
    hides or scolds if skipped; a quiet ring highlights it from Sunday
    4pm through end of Monday. Built on the same step-dialog engine as
    the daily review, so it autosaves, resumes correctly if closed
    partway through, and ends with the same calm completion moment.
- **Journal** — a monthly calendar + daily entry at `/journal`:
  - A Monday-first month calendar (mono date numbers, a quiet dot on any
    day with a saved entry, a subtle amber ring on today), with `<` `>`
    month navigation. Defaults to the current month with today selected.
  - Tapping a day loads its entry below: a markdown-friendly textarea
    that autosaves ~800ms after you stop typing, with a small "Saved"
    tick that fades in and out. Switching days (or leaving the page)
    mid-typing flushes the pending save immediately first — no edit is
    ever lost.
  - **Mood and energy**, two rows of 5 quiet dots above the entry, saved
    the instant you tap one — no debounce needed since there's no typing
    to wait out.
  - The entry editor keeps a comfortable ~720px reading width even
    though the page itself uses the app's wider default column — the
    calendar (structural) stays full width, only the prose narrows.
  - A calm invitation ("What happened today?") on any day with nothing
    written yet, instead of a blank apology.
- **"Field Log" visual identity** — a paper-and-ink, brass-instrument look
  grounded in field journals and navigation instruments, replacing an
  earlier dark-mode-plus-one-accent look that read as generic
  (see DECISIONS.md):
  - **Design tokens**: "Day — paper" (warm paper/ink) and
    "Night — chart table" (charcoal/cream) themes, with brass as the
    sole primary accent (today/active/completion only), chart-blue as a
    quiet secondary accent (links/structure), and a rare seal-red
    reserved for ceremonial moments.
  - **Typography**: Fraunces (a field-journal-masthead serif) for
    display/headings, Karla for body/UI text, and Space Mono for
    dates/counts/data — a typewriter-register feel for anything numeric.
  - **A hand-drawn icon set** app-wide: every icon is a thin-stroke
    original glyph with exactly one small brass accent detail — a
    sunrise arc for Today, fanned note-cards for Inbox, seven dots for
    Week, a flag with a brass pennant for Goals, a fountain-pen nib for
    Journal, a small constellation for Insights — with active nav icons
    shown as a filled/emphasized variant of the same glyph, not just a
    color change.
  - **A compass-rose signature mark** — a thin circle with four cardinal
    lines and one brass-filled kite at north — appears exactly once, in
    the desktop rail's wordmark.
- **Light and dark themes**, following the system setting by default.
- **Installable, offline-first PWA** — the app shell is precached, so it
  loads and works with no network connection.
- **Local-first storage** — all data lives in IndexedDB on-device; nothing
  leaves your browser today.

## Tech stack

- **React 18** + **TypeScript**, built with **Vite**
- **Tailwind CSS** for styling, driven entirely by design tokens
- **Fraunces**, **Karla**, and **Space Mono** (self-hosted via Fontsource)
  for display, body, and data/mono type respectively
- **Dexie** (IndexedDB) for local-first storage, with `dexie-react-hooks`
  for reactive queries
- **Zustand** for UI-only state (theme preference, dialog open/closed)
- **React Router** for navigation
- **vite-plugin-pwa** (Workbox) for the installable, offline app shell
- **Vitest** + `fake-indexeddb` for testing the data layer

Cloud sync (Supabase) is planned but not yet built — today the app is
entirely local, single-device.

## Getting started

Requires **Node `^20.19.0` or `>=22.12.0`** (Vite 8's requirement).

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

```bash
npm run test
```

## Project structure

```
src/
  db/            Dexie database, schema, and product-rule enforcement
    repo/        The ONLY files allowed to touch Dexie directly — one
                 module per domain (habits, tasks, goals, journal, ...)
  types/         Shared TypeScript interfaces — the data contract
  components/    Reusable UI (shell, nav, dialogs, icons, design-system
                 primitives) and today/ for Today-screen-specific pieces
  pages/         Route-level screens
  styles/        tokens.css — the only place raw colors/spacing/type live
  lib/           Small framework-agnostic helpers (dates, hooks)
```

Components never import Dexie directly — they call into `src/db/repo/*.ts`,
which is the only layer that touches the database.

## Roadmap

- [x] Project scaffold (Vite + React + TS + Tailwind + PWA)
- [x] Design system: theming (light/dark) and iOS-inspired polish
- [x] Local data layer (Dexie schema, repos, product-rule enforcement)
- [x] Today screen (MITs, habits, year grain, evening review)
- [x] Focus mode & "I'm stuck" support
- [x] Inbox (quick capture triage)
- [x] Goals cascade (year → month)
- [x] Week view
- [x] Journal
- [x] Guided reviews (daily, weekly, monthly, yearly)
- [ ] Insights
- [ ] PWA hardening
- [ ] Cloud sync (Supabase)

---

Personal project / portfolio piece — not affiliated with any company.
