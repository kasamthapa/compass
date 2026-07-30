# Progress

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
- Consider `prefers-color-scheme` light theme support once dark theme is
  validated (spec says dark-only "for now").
