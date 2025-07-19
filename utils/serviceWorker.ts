// Service Worker Registration
export const registerServiceWorker = async (): Promise<void> => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registered successfully:", registration);

      // Handle updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // New service worker available
              if (
                confirm(
                  "نسخه جدیدی از برنامه در دسترس است. آیا می‌خواهید آن را نصب کنید؟"
                )
              ) {
                newWorker.postMessage({ type: "SKIP_WAITING" });
                window.location.reload();
              }
            }
          });
        }
      });

      // Handle service worker updates
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        console.log("Service Worker updated");
      });
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  }
};

// Check if app is installed as PWA
export const isPWAInstalled = (): boolean => {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
};

// Check if app is online
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Get cache storage info
export const getCacheInfo = async (): Promise<{
  staticCache: number;
  audioCache: number;
}> => {
  if (!("caches" in window)) {
    return { staticCache: 0, audioCache: 0 };
  }

  try {
    const cacheNames = await caches.keys();
    let staticCacheSize = 0;
    let audioCacheSize = 0;

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();

      if (cacheName.includes("audio")) {
        audioCacheSize += keys.length;
      } else {
        staticCacheSize += keys.length;
      }
    }

    return { staticCache: staticCacheSize, audioCache: audioCacheSize };
  } catch (error) {
    console.error("Error getting cache info:", error);
    return { staticCache: 0, audioCache: 0 };
  }
};

// Clear all caches
export const clearAllCaches = async (): Promise<void> => {
  if (!("caches" in window)) {
    return;
  }

  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
    console.log("All caches cleared");
  } catch (error) {
    console.error("Error clearing caches:", error);
    throw error;
  }
};

// Preload specific audio files
export const preloadAudioFiles = async (urls: string[]): Promise<void> => {
  if (!("caches" in window)) {
    return;
  }

  try {
    const cache = await caches.open("hisnul-muslim-audio-v1");

    for (const url of urls) {
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
    console.error("Error preloading audio files:", error);
  }
};

// Request background sync for audio preloading
export const requestBackgroundSync = async (): Promise<void> => {
  if (
    "serviceWorker" in navigator &&
    "sync" in (window.ServiceWorkerRegistration.prototype as any)
  ) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync.register("preload-audio");
      console.log("Background sync registered for audio preloading");
    } catch (error) {
      console.error("Error registering background sync:", error);
    }
  }
};

// Install prompt for PWA
export const showInstallPrompt = async (): Promise<boolean> => {
  let deferredPrompt: any;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });

  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    return outcome === "accepted";
  }

  return false;
};

// Network status monitoring
export const setupNetworkMonitoring = (
  onOnline: () => void,
  onOffline: () => void
): (() => void) => {
  const handleOnline = () => {
    console.log("App is online");
    onOnline();
  };

  const handleOffline = () => {
    console.log("App is offline");
    onOffline();
  };

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
};
