import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Digital Dominance is intentionally platform-neutral.
// Base44 is a donor/source estate only and is not part of the active Vite runtime.
// The explicit @ alias replaces the hidden alias previously supplied by the vendor plugin.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
