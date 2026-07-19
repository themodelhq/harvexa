import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Note: we deliberately do NOT use vite-plugin-pwa's generateSW step here.
// Its bundled workbox-build loader throws "Dynamic require of workbox-build
// is not supported" on several CI build images (Netlify included), because
// of an ESM/CJS resolution mismatch in that dependency chain. Since our PWA
// needs are simple (installable + basic offline app-shell caching), we ship
// a small hand-written service worker instead (see public/sw.js) and skip
// the workbox toolchain entirely.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
