import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// La base con subruta solo hace falta para el build de producción que se
// publica en GitHub Pages (sirve desde /rachas/); en local
// (`npm run dev`) se mantiene en la raíz.
export default defineConfig(({ command }) => {
  const base = command === 'build' ? '/rachas/' : '/'
  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg'],
        manifest: {
          name: 'Rachas — seguimiento de hábitos',
          short_name: 'Rachas',
          description: 'Sigue tus hábitos, un día cada vez.',
          lang: 'es',
          theme_color: '#f7f5fb',
          background_color: '#f7f5fb',
          display: 'standalone',
          start_url: base,
          scope: base,
          icons: [
            { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
      }),
    ],
  }
})
