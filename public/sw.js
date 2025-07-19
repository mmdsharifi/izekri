const CACHE_NAME = "hisnul-muslim-v1";
const AUDIO_CACHE_NAME = "hisnul-muslim-audio-v1";

// Files to cache for offline functionality
const STATIC_FILES = [
  "/",
  "/index.html",
  "/static/js/bundle.js",
  "/static/css/main.css",
  "/manifest.json",
  "/favicon.ico",
];

// Install event - cache static files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(STATIC_FILES);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== AUDIO_CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - handle requests
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle audio files
  if (request.destination === "audio" || url.pathname.includes(".mp3")) {
    event.respondWith(handleAudioRequest(request));
    return;
  }

  // Handle other requests
  if (request.method === "GET") {
    event.respondWith(handleStaticRequest(request));
  }
});

// Handle audio requests with caching
async function handleAudioRequest(request) {
  try {
    // Try to get from cache first
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      console.log("Audio served from cache:", request.url);
      return cachedResponse;
    }

    // If not in cache, fetch from network
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Clone the response and cache it
      const responseToCache = networkResponse.clone();
      cache.put(request, responseToCache);
      console.log("Audio cached:", request.url);
    }

    return networkResponse;
  } catch (error) {
    console.error("Error handling audio request:", error);

    // Try to get from cache as fallback
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      console.log("Audio served from cache (fallback):", request.url);
      return cachedResponse;
    }

    // Return error response
    return new Response("Audio not available", {
      status: 404,
      statusText: "Not Found",
    });
  }
}

// Handle static file requests
async function handleStaticRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("Network failed, trying cache:", request.url);

    // Fallback to cache
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page if available
    const offlineResponse = await cache.match("/offline.html");
    if (offlineResponse) {
      return offlineResponse;
    }

    // Return error response
    return new Response("Offline - Content not available", {
      status: 503,
      statusText: "Service Unavailable",
    });
  }
}

// Background sync for audio preloading
self.addEventListener("sync", (event) => {
  if (event.tag === "preload-audio") {
    event.waitUntil(preloadAudioFiles());
  }
});

// Preload audio files in background
async function preloadAudioFiles() {
  try {
    const audioUrls = [
      // Add common audio URLs here for preloading
      "http://www.hisnmuslim.com/audio/ar/41.mp3",
      "http://www.hisnmuslim.com/audio/ar/42.mp3",
      "http://www.hisnmuslim.com/audio/ar/33.mp3",
      "http://www.hisnmuslim.com/audio/ar/48.mp3",
    ];

    const cache = await caches.open(AUDIO_CACHE_NAME);

    for (const url of audioUrls) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response);
          console.log("Preloaded audio:", url);
        }
      } catch (error) {
        console.error("Failed to preload audio:", url, error);
      }
    }
  } catch (error) {
    console.error("Error in background audio preloading:", error);
  }
}

// Handle push notifications (for future use)
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
      },
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(clients.openWindow("/"));
});
