import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

const normalizeBasePath = (basePath) => {
  const withLeadingSlash = basePath.startsWith('/') ? basePath : `/${basePath}`
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`
}

const appBase = normalizeBasePath(process.env.VITE_BASE_PATH || '/pll_recognition_trainer/')

// https://vitejs.dev/config/
export default defineConfig({
  base: appBase,
  plugins: [
    vue(),
    VitePWA({
      base: appBase,
      scope: appBase,
      registerType: 'autoUpdate',
      includeManifestIcons: false,
      manifest: {
        id: appBase,
        name: 'PLL Recognition Trainer',
        short_name: 'PLL Trainer',
        description: 'Adaptive, keyboard-driven PLL recognition trainer for speedcubers',
        start_url: appBase,
        scope: appBase,
        display: 'standalone',
        // Match the default Darkly theme before Vue can read localStorage.
        background_color: '#222222',
        theme_color: '#222222',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        navigateFallback: `${appBase}index.html`,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
      },
      devOptions: {
        enabled: process.env.VITE_PWA_DEV === 'true'
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
