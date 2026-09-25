import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// La base con subruta solo hace falta para el build de producción que se
// publica en GitHub Pages (sirve desde /rachas/); en local
// (`npm run dev`) se mantiene en la raíz.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/rachas/' : '/',
  plugins: [react()],
}))
