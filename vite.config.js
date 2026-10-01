import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { serverSeoShellsPlugin } from './scripts/server-seo-shells.mjs'

// Preserve the existing Base44 runtime while adding deterministic, verified
// server-visible shells for approved public SEO routes.
export default defineConfig({
  plugins: [
    base44({
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: true,
      navigationNotifier: true,
      analyticsTracker: true,
      visualEditAgent: true
    }),
    react(),
    serverSeoShellsPlugin(),
  ]
});
