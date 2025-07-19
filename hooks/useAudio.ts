import { useState, useEffect, useMemo, useCallback } from "react";

interface CachedAudio {
  url: string;
  blob: Blob;
  timestamp: number;
}

class AudioCache {
  private cacheName = "hisnul-muslim-audio-cache";
  private dbName = "HisnulMuslimAudioDB";
  private dbVersion = 1;
  private storeName = "audioCache";

  async initDB(): Promise<IDBDatabase> {
    // Check if IndexedDB is available
    if (!window.indexedDB) {
      throw new Error("IndexedDB is not supported in this browser");
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, {
            keyPath: "url",
          });
          store.createIndex("timestamp", "timestamp", { unique: false });
        }
      };
    });
  }

  async getCachedAudio(url: string): Promise<Blob | null> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], "readonly");
        const store = transaction.objectStore(this.storeName);
        const request = store.get(url);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const result = request.result as CachedAudio | undefined;
          if (result && this.isCacheValid(result.timestamp)) {
            resolve(result.blob);
          } else {
            resolve(null);
          }
        };
      });
    } catch (error) {
      console.error("Error getting cached audio:", error);
      return null;
    }
  }

  async cacheAudio(url: string, blob: Blob): Promise<void> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], "readwrite");
        const store = transaction.objectStore(this.storeName);
        const cachedAudio: CachedAudio = {
          url,
          blob,
          timestamp: Date.now(),
        };

        const request = store.put(cachedAudio);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error("Error caching audio:", error);
    }
  }

  async clearOldCache(
    maxAge: number = 30 * 24 * 60 * 60 * 1000
  ): Promise<void> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], "readwrite");
        const store = transaction.objectStore(this.storeName);
        const index = store.index("timestamp");
        const cutoffTime = Date.now() - maxAge;

        const request = index.openCursor(IDBKeyRange.upperBound(cutoffTime));
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const cursor = request.result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            resolve();
          }
        };
      });
    } catch (error) {
      console.error("Error clearing old cache:", error);
    }
  }

  private isCacheValid(
    timestamp: number,
    maxAge: number = 30 * 24 * 60 * 60 * 1000
  ): boolean {
    return Date.now() - timestamp < maxAge;
  }

  async getCacheSize(): Promise<number> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], "readonly");
        const store = transaction.objectStore(this.storeName);
        const request = store.count();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });
    } catch (error) {
      console.error("Error getting cache size:", error);
      return 0;
    }
  }
}

const audioCache = new AudioCache();

export const useAudio = (url: string) => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);

  // Initialize audio element with caching
  useEffect(() => {
    if (!url) {
      setAudio(null);
      return;
    }

    const initializeAudio = async () => {
      setLoading(true);
      setError(null);

      try {
        // Check if audio is cached
        const cachedBlob = await audioCache.getCachedAudio(url);

        if (cachedBlob) {
          // Use cached audio
          const audioUrl = URL.createObjectURL(cachedBlob);
          const audioElement = new Audio(audioUrl);
          setAudio(audioElement);
          setIsCached(true);
          setLoading(false);
        } else {
          // Download and cache audio
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const blob = await response.blob();

          // Cache the audio
          await audioCache.cacheAudio(url, blob);

          // Create audio element
          const audioUrl = URL.createObjectURL(blob);
          const audioElement = new Audio(audioUrl);
          setAudio(audioElement);
          setIsCached(false);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading audio:", err);

        // If caching failed, try direct URL as fallback
        try {
          console.log("Trying fallback to direct URL:", url);
          const audioElement = new Audio(url);

          // Add error handler for the audio element
          audioElement.addEventListener("error", (e) => {
            console.error("Audio element error:", e);
            setError("Failed to load audio file");
            setLoading(false);
          });

          // Add load handler to clear loading state
          audioElement.addEventListener("canplaythrough", () => {
            setLoading(false);
            setError(null);
          });

          setAudio(audioElement);
          setIsCached(false);
        } catch (fallbackErr) {
          console.error("Fallback audio loading failed:", fallbackErr);
          setError(err instanceof Error ? err.message : "Failed to load audio");
          setLoading(false);
        }
      }
    };

    initializeAudio();

    // Cleanup function
    return () => {
      if (audio) {
        audio.pause();
        if (audio.src.startsWith("blob:")) {
          URL.revokeObjectURL(audio.src);
        }
      }
    };
  }, [url]);

  const toggle = useCallback(() => {
    if (audio && !loading) {
      setPlaying(!playing);
    }
  }, [audio, playing, loading]);

  const play = useCallback(() => {
    if (audio && !loading && !playing) {
      setPlaying(true);
    }
  }, [audio, loading, playing]);

  const pause = useCallback(() => {
    if (audio && !loading && playing) {
      setPlaying(false);
    }
  }, [audio, loading, playing]);

  const stop = useCallback(() => {
    if (audio && !loading) {
      audio.currentTime = 0;
      setPlaying(false);
    }
  }, [audio, loading]);

  // Handle play/pause logic
  useEffect(() => {
    if (!audio) return;

    const playPromise = playing ? audio.play() : null;
    if (playPromise) {
      playPromise.catch((error) => {
        console.error("Error playing audio:", error);
        setPlaying(false);
        setError("Failed to play audio");
      });
    } else {
      audio.pause();
    }
  }, [playing, audio]);

  // Handle audio ended event
  useEffect(() => {
    if (!audio) return;

    const handleEnded = () => setPlaying(false);
    const handleError = (e: Event) => {
      console.error("Audio error:", e);
      setError("Audio playback error");
      setPlaying(false);
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      if (!audio.paused) {
        audio.pause();
      }
    };
  }, [audio]);

  return {
    playing,
    toggle,
    play,
    pause,
    stop,
    loading,
    error,
    isCached,
    audio,
  };
};

// Cache management utilities
export const clearAudioCache = async (): Promise<void> => {
  await audioCache.clearOldCache(0); // Clear all cache
};

export const getCacheSize = async (): Promise<number> => {
  return await audioCache.getCacheSize();
};

export const preloadAudio = async (url: string): Promise<void> => {
  try {
    const cachedBlob = await audioCache.getCachedAudio(url);
    if (!cachedBlob) {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      await audioCache.cacheAudio(url, blob);
    }
  } catch (error) {
    console.error("Error preloading audio:", error);
  }
};
