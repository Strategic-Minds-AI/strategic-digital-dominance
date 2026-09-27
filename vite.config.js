import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Digital Dominance is intentionally platform-neutral.
// Base44 is a donor/source estate only and is not part of the active Vite runtime.
export default defineConfig({
  plugins: [react()],
})
