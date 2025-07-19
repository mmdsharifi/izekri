import React from "react";
import { useAudio } from "../hooks/useAudio";
import { PlayIcon, PauseIcon } from "./icons";

interface AudioPlayerProps {
  src: string;
  className?: string;
  showCacheStatus?: boolean;
}

const AudioPlayer = ({
  src,
  className = "",
  showCacheStatus = false,
}: AudioPlayerProps) => {
  const { playing, toggle, loading, error, isCached } = useAudio(src);

  const baseClasses =
    "flex items-center justify-center w-14 h-14 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-transform transform hover:scale-110 dark:focus:ring-offset-gray-800";

  const getButtonClasses = () => {
    if (error) {
      return `${baseClasses} bg-red-500 hover:bg-red-600 focus:ring-red-500 cursor-not-allowed`;
    }
    if (loading) {
      return `${baseClasses} bg-gray-400 hover:bg-gray-500 focus:ring-gray-400 cursor-wait`;
    }
    return `${baseClasses} bg-teal-500 hover:bg-teal-600 focus:ring-teal-500 ${className}`;
  };

  const handleClick = () => {
    if (!loading && !error) {
      toggle();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className={getButtonClasses()}
        aria-label={playing ? "Pause audio" : "Play audio"}
        disabled={loading || !!error}
        title={
          error
            ? `Error: ${error}`
            : loading
            ? "Loading..."
            : playing
            ? "Pause"
            : "Play"
        }
      >
        {loading ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : error ? (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        ) : playing ? (
          <PauseIcon className="w-6 h-6" />
        ) : (
          <PlayIcon className="w-6 h-6 ml-1" />
        )}
      </button>

      {showCacheStatus && isCached && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
          <svg
            className="w-2 h-2 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
