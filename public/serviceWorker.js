const urlToCache = ["index.html", "manifest.json", "favicon.ico"];
const cacheName = "weather-app-cache-v1";


const self = this;
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(cacheName).then((cache) => {
            return cache.addAll(urlToCache);
        })
    );
});

//listen for fetch events and serve cached content when available
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                return response; // Return cached response if found
            }
            return fetch(event.request).caches.match("ofline.html"); // Fallback to offline page if not found in cache
        })
    );
}); 

// Activate the service worker and remove old caches
self.addEventListener("activate", (event) => {
   const cacheWhitelist = [cacheName];
   event.waitUntil(
       caches.keys().then((cacheNames) => {
              return Promise.all(   
                    cacheNames.map((cache) => {
                        if (!cacheWhitelist.includes(cache)) {
                            return caches.delete(cache); // Delete old caches
                        }
                    })
              );
       })
   );
}); 