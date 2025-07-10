
import React from 'react';
import { useAudio } from '../hooks/useAudio';
import { PlayIcon, PauseIcon } from './icons';

interface AudioPlayerProps {
  src: string;
}

const AudioPlayer = ({ src }: AudioPlayerProps) => {
  const { playing, toggle } = useAudio(src);

  return (
    <button
      onClick={toggle}
      className="flex items-center justify-center w-14 h-14 rounded-full bg-teal-500 text-white hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:focus:ring-offset-gray-800 transition-transform transform hover:scale-110"
      aria-label={playing ? 'Pause audio' : 'Play audio'}
    >
      {playing ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6 ml-1" />}
    </button>
  );
};

export default AudioPlayer;
