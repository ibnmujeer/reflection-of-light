// Service worker for offline play. The build fills in CACHE and FILES.
// Cache first: after the first visit, everything comes from the device.
const CACHE = 'awwfy-reflection-of-light-mvs6o9qj';
const PREFIX = 'awwfy-reflection-of-light-';
const FILES = ["./","./apple-touch-icon.png","./assets/A01-B2WMMez2.png","./assets/A02-Et-TQV8N.png","./assets/A03-WNAuoHWM.png","./assets/A04-BAEG0Ck1.png","./assets/A05-CcshpWVK.png","./assets/A06-DxzCu8nF.png","./assets/A07-CK_CkMK-.webp","./assets/A08-Cf_H6AtP.webp","./assets/A09-C45A7PCH.png","./assets/A10-BaBVc1I3.png","./assets/bunny-jump-LEaC80Nf.png","./assets/bunny-wave-CzDqc9h4.png","./assets/emblem-arm-bl-DLAWJ2xe.png","./assets/emblem-arm-br-krCHUBDy.png","./assets/emblem-arm-tl-Ca6DMpTX.png","./assets/emblem-arm-tr-CHjBr36Q.png","./assets/emblem-full-CsJ8-RcG.png","./assets/F01-play-WhYhtm_Q.png","./assets/F02-next--_E_f85B.png","./assets/F03-retry-DbAN3ZEn.png","./assets/F04-hint-9X9dKx1s.png","./assets/F05-undo-DJelX_sP.png","./assets/F06-pause-BqTxUt46.png","./assets/F07-menu-KcwzfFOr.png","./assets/F08-sound-on-oQHomjU7.png","./assets/F09-sound-off-C19nAHZ6.png","./assets/F10-help-9Sui-VUU.png","./assets/F11-exit-BrhP4l2_.png","./assets/fredoka-latin-400-normal-17JuUzdy.woff2","./assets/fredoka-latin-400-normal-DbXSrOeS.woff","./assets/fredoka-latin-500-normal-B0JifZgm.woff2","./assets/fredoka-latin-500-normal-BL692wg7.woff","./assets/fredoka-latin-600-normal-C4zohCW5.woff2","./assets/fredoka-latin-600-normal-CcrEjrB4.woff","./assets/fredoka-latin-700-normal-BOIZVyIN.woff2","./assets/fredoka-latin-700-normal-C8FeHd3X.woff","./assets/index-Cd2y06po.css","./assets/index-Dmz9ODm4.js","./assets/wordmark-white-bA4KL13H.png","./favicon-32.png","./icon-192.png","./icon-512.png","./index.html","./manifest.webmanifest"];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(FILES))
      .then(() => self.skipWaiting()),
  );
});

// A new version removes the old caches of this game.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith(PREFIX) && k !== CACHE).map((k) => caches.delete(k)),
      ))
      .then(() => self.clients.claim()),
  );
});

// Visit counting (Cloudflare Web Analytics) is network only. It is never cached, and offline it just fails quietly.
const isAnalytics = (url) => url.hostname.endsWith('cloudflareinsights.com') || url.pathname.includes('/cdn-cgi/');

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || isAnalytics(url)) return;

  event.respondWith(
    // ignoreVary: a server may send "Vary: Origin", which would make module scripts miss the cache.
    caches.match(request, { ignoreVary: true }).then((saved) => {
      if (saved) return saved;
      return fetch(request).catch(() => {
        // Offline and not saved: pages fall back to the game, other files fail honestly.
        if (request.mode === 'navigate') return caches.match('./index.html', { ignoreVary: true });
        return Response.error();
      });
    }),
  );
});
