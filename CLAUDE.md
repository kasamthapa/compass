# CLAUDE.md — Compass project instructions

## What this project is

A personal, local-first PWA: habit tracker + planner + journal + goal cascade
(year→month→week→day) + guided reviews. Single user (me). Laptop + phone.

## Golden rules

1. LOCAL-FIRST: Dexie/IndexedDB is the source of truth. No network calls
   except in the sync module (Phase 8). The app must be 100% functional offline.
2. DESIGN TOKENS ONLY: All colors/type/spacing come from src/styles/tokens.css.
   Never hardcode a hex value or font-family in a component.
3. BEHAVIOR PRINCIPLES: flexible streaks (X-of-7, no resets), max 5 active
   habits, max 3 MITs/day, max 3 weekly priorities, no guilt language,
   'skipped' is neutral. These are product law — do not "improve" them.
4. SPEED: interactions must feel instant. Use Dexie liveQuery for reactive
   reads. No spinners for local operations.
5. TYPES: strict TypeScript. The interfaces in src/types/models.ts are the
   contract — change them only if the phase prompt says so.
6. SCOPE: build ONLY what the current phase prompt asks. If you see a
   tempting improvement, list it under "Suggestions" in your summary
   instead of building it.
7. FILES: small components, one responsibility. Repository functions in
   src/db/repo/\*.ts are the only place that touches Dexie directly.
   Components never import Dexie.
8. After each phase: update PROGRESS.md with what was built, decisions
   made, and known issues. Run `npm run build` and fix all errors before
   finishing.

## Commands

- dev: npm run dev
- build & typecheck: npm run build
- test: npm run test (Vitest)

## Definition of done for any phase

- Builds with zero TS errors
- Works at 360px and 1280px widths
- Keyboard accessible (tab order, Enter/Escape work in dialogs)
- No console errors
- PROGRESS.md updated

## Git workflow

- Commit at every small logical checkpoint (a working function, a fix) with a
  clear message. Only commit code that passes `npm run build` with zero TS errors.
- Use conventional messages: "feat: add habit toggle", "fix: week strip
  off-by-one", "chore: scaffold PWA config".
- Do NOT push after every commit. Push only when I confirm a phase's review
  checklist has passed. I'll say "phase N passed — push".
- Commit as me only. Do NOT add yourself as a contributor, co-author, or author
  in any way: no "Co-authored-by" trailers, no "Generated with Claude Code" lines,
  no Claude/Anthropic in the commit message, author, or committer fields. Commits
  must use only my configured git user.name and user.email.
- Never commit node_modules, .env, or secrets. Ensure .gitignore covers them.
- If a phase goes wrong, I may reset to the last pushed commit — so keep each
  pushed state fully working.
