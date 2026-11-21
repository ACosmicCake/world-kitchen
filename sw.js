// Service worker: makes World Kitchen work fully offline after the first visit.
// When you change any app file, bump VERSION so devices pick up the new copy.
const VERSION = "wk-v9";
const APP_SHELL = [
  "./", "./index.html", "./styles.css", "./app.js",
  "./data/recipes.js", "./data/extra-recipes.js", "./data/ingredients.js", "./data/nutrition.js", "./data/prices.js", "./data/workouts.js", "./data/sources.js",
  "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-180.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const isFont = ["fonts.googleapis.com", "fonts.gstatic.com", "upload.wikimedia.org"].includes(url.hostname); // fonts + ingredient photos
  if (url.origin !== location.origin && !isFont) return; // links to recipe sources etc. go straight to the network

  // Stale-while-revalidate: answer instantly from cache, refresh the cache in the background.
  e.respondWith(caches.open(VERSION).then(async (cache) => {
    const cached = await cache.match(req, { ignoreSearch: !isFont }) || (req.mode === "navigate" ? await cache.match("./index.html") : undefined);
    const network = fetch(req).then((res) => {
      if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone());
      return res;
    }).catch(() => cached);
    return cached || network;
  }));
});
