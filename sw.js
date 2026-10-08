/* Service worker: offline běh + příprava na denní oznámení.
   Verzi zvedni (v1 -> v2 ...) při změně těchto pravidel, aby se stará cache smazala. */
const VERSION = 'v6';
const CACHE = 'letecke-zkousky-' + VERSION;

// App shell + velká neměnná data. Obrázky se dokešují až za běhu (podle potřeby).
const CORE = [
  './', './index.html', './manifest.json',
  './questions.json', './explain.json',
  './icon-192.png', './icon-512.png', './apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(CORE.map(u => c.add(u))))   // allSettled: když jeden chybí, neshodí to instalaci
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch { return; }
  if (url.origin !== location.origin) return;                  // cizí origin (fonty) -> necháme na síti

  // index.html i config.js vždy ze sítě (ať se změny projeví hned), offline fallback z cache
  const isIndex = req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('index.html') || url.pathname.endsWith('config.js');

  if (isIndex) {
    // nejdřív síť (ať jsou novinky), offline fallback z cache
    e.respondWith((async () => {
      try {
        const r = await fetch(req);
        if (r && r.ok) { const c = await caches.open(CACHE); c.put(req, r.clone()); }
        return r;
      } catch { return (await caches.match(req)) || (await caches.match('./index.html')) || Response.error(); }
    })());
    return;
  }

  // ostatní (data, obrázky, ikony): nejdřív cache, pak síť (a ulož)
  e.respondWith((async () => {
    const hit = await caches.match(req);
    if (hit) return hit;
    try {
      const r = await fetch(req);
      if (r && r.ok && (r.type === 'basic' || r.type === 'default')) {
        const c = await caches.open(CACHE); c.put(req, r.clone());
      }
      return r;
    } catch { return hit || Response.error(); }
  })());
});

// ----- Oznámení (připraveno; denní doručení i při zavřené appce vyžaduje push server) -----
const MSGS = [
  'Nauč se dnes něco nového ✈️',
  'Pár otázek denně a zkouška je tvoje 💪',
  'Čas na procvičování! Otevři a dej si 10 otázek.',
  'Meteo, navigace, předpisy… co si dnes zopakuješ?',
  'Krok ke zkoušce: 5 minut procvičování stačí.'
];
function pickMsg() { return MSGS[Math.floor(Math.random() * MSGS.length)]; }

// Push z (budoucího) serveru
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { body: e.data ? e.data.text() : '' }; }
  const title = d.title || 'ÚCL Zkoušky';
  const body = d.body || pickMsg();
  e.waitUntil(self.registration.showNotification(title, {
    body, icon: './icon-192.png', badge: './icon-192.png', tag: 'daily', lang: 'cs'
  }));
});

// Periodická synchronizace (Chrome/Android, nejlepší bez serveru) -> denní připomínka
self.addEventListener('periodicsync', e => {
  if (e.tag === 'daily-reminder') {
    e.waitUntil(self.registration.showNotification('ÚCL Zkoušky', {
      body: pickMsg(), icon: './icon-192.png', badge: './icon-192.png', tag: 'daily', lang: 'cs'
    }));
  }
});

// Klik na oznámení -> otevři/zaostři appku
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(ws => {
    for (const w of ws) { if ('focus' in w) return w.focus(); }
    return self.clients.openWindow('./');
  }));
});
