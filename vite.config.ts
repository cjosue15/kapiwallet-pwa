import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg', 'kapiwallet.png'],
      manifest: {
        name: 'KapiWallet',
        short_name: 'KapiWallet',
        description: 'Personal finance tracking application',
        theme_color: '#1A1B1B',
        background_color: '#1A1B1B',
        display: 'standalone',
        icons: [
          {
            src: 'kapiwallet.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'kapiwallet.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
