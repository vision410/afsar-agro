const CACHE_NAME = "afsar-agro-cache-v1";
const urlsToCache = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/script_final.js", // change if using different file
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js" // external lib
];

// Install and cache files
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log("✅ Caching app shell");
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch from cache first
self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    }).catch(() => {
      return caches.match("./index.html");
    })
  );
});

// Clean old caches
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log("🧹 Removing old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
