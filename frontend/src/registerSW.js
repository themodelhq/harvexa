// Registers the hand-written service worker (public/sw.js) in production
// builds only — running it in dev would cache Vite's HMR assets and cause
// stale-code headaches.
export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  if (import.meta.env.DEV) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}
