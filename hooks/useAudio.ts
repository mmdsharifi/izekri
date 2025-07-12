
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

export const useAudio = (url: string) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  // Clean up previous audio instance when URL changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current.load();
    }
    
    if (url) {
      try {
        audioRef.current = new Audio(url);
      } catch (error) {
        console.error(`Failed to create audio object for url: ${url}`, error);
        audioRef.current = null;
      }
    } else {
      audioRef.current = null;
    }
  }, [url]);

  const toggle = useCallback(() => {
    if (audioRef.current) {
      setPlaying(!playing);
    }
  }, [playing]);

  useEffect(() => {
    if (!audioRef.current) return;

    const playPromise = playing ? audioRef.current.play() : null;
    if (playPromise) {
        playPromise.catch(error => {
            console.error("Error playing audio:", error);
            setPlaying(false);
        });
    } else {
        audioRef.current.pause();
    }
  }, [playing]);

  useEffect(() => {
    if (!audioRef.current) return;

    const handleEnded = () => setPlaying(false);
    audioRef.current.addEventListener('ended', handleEnded);
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleEnded);
        if (!audioRef.current.paused) {
            audioRef.current.pause();
        }
      }
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.load();
      }
    };
  }, []);

  return { playing, toggle };
};
