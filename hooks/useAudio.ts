
import { useState, useEffect, useMemo, useCallback } from 'react';

export const useAudio = (url: string) => {
  const audio = useMemo(() => {
    if (url) {
      try {
        return new Audio(url);
      } catch (error) {
        console.error(`Failed to create audio object for url: ${url}`, error);
        return null;
      }
    }
    return null;
  }, [url]);
  
  const [playing, setPlaying] = useState(false);

  const toggle = useCallback(() => {
    if (audio) {
      setPlaying(!playing);
    }
  }, [audio, playing]);

  useEffect(() => {
    if (!audio) return;

    const playPromise = playing ? audio.play() : null;
    if (playPromise) {
        playPromise.catch(error => {
            console.error("Error playing audio:", error);
            setPlaying(false);
        });
    } else {
        audio.pause();
    }
  }, [playing, audio]);

  useEffect(() => {
    if (!audio) return;

    const handleEnded = () => setPlaying(false);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
      if (!audio.paused) {
          audio.pause();
      }
    };
  }, [audio]);

  return { playing, toggle };
};
