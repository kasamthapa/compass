import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'favicon.ico', 'apple-touch-icon.png'],
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
      },
    }),
  ],
  test: {
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
  },
})
