import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // Settings' About section shows this as a build indicator — the app has
  // no formal release versioning (package.json's version is a placeholder),
  // so a build date is the honest, low-effort thing to show instead of a
  // fabricated version number. See DECISIONS.md.
  define: {
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
  plugins: [
    react(),
    VitePWA({
      // 'prompt', not 'autoUpdate': the app must never silently swap code
      // out from under an in-progress action (e.g. someone mid-typing in
      // the Journal composer before the debounced save fires). A new
      // version waits until the user explicitly taps "Refresh" on the
      // update toast (src/components/UpdateToast.tsx). See DECISIONS.md.
      registerType: 'prompt',
      // We register the service worker ourselves via the `useRegisterSW`
      // hook (virtual:pwa-register/react) so the app can render the update
      // toast — the default auto-injected register script has no hook for
      // the app to observe "a new version is waiting."
      injectRegister: false,
      // Only favicon.ico needs listing here — every other icon/manifest
      // asset already matches workbox.globPatterns below (.svg/.png are
      // both in the glob), so adding them here too just double-precached
      // the same files under two entries. Found during the Phase 7B
      // precache audit; see DECISIONS.md.
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'Compass',
        short_name: 'Compass',
        description: 'A local-first habit tracker, planner, and journal.',
        theme_color: '#1b1b17',
        background_color: '#1b1b17',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          // Dedicated maskable assets — NOT the same file as the 'any'
          // icons above. Their compass-rose mark is drawn inside the
          // inner 80% safe zone so Android's circular/squircle adaptive-
          // icon crop can't clip the ring or the brass kite. Verified
          // with a circular-crop simulation during generation; see
          // DECISIONS.md.
          { src: '/icon-192-maskable.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // The four manifest icon files (any + maskable, 192/512) are
        // already guaranteed precached automatically because they're
        // listed in manifest.icons above — vite-plugin-pwa injects them
        // into the precache manifest independently of this glob. Without
        // this exclusion they were being double-precached (once via the
        // glob match, once via the manifest-icon injection) — found during
        // the Phase 7B precache audit. apple-touch-icon.png and icon.svg
        // are NOT manifest icons, so they still rely on (and correctly get)
        // exactly one precache entry from this glob.
        globIgnores: ['icon-192.png', 'icon-512.png', 'icon-192-maskable.png', 'icon-512-maskable.png'],
        // Without this, a hard refresh or deep link into any route other
        // than '/' (e.g. '/week') fails outright while offline — only the
        // exact precached URLs match by default, and 'index.html' is the
        // only HTML entry precached. This makes every navigation request
        // that doesn't match a precached asset fall back to the cached app
        // shell, which then lets React Router resolve the route client-side.
        // Found missing during the Phase 7B precache audit; see DECISIONS.md.
        navigateFallback: 'index.html',
      },
    }),
  ],
  test: {
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
  },
})
