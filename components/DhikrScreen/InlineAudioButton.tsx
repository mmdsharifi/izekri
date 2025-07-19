import React from "react";
import { useAudio } from "../../hooks/useAudio";
import { SpeakerIcon } from "../icons";

const InlineAudioButton = ({ src }: { src: string }) => {
  const { playing, toggle, loading, error } = useAudio(src);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!loading && !error) {
      toggle();
    }
  };

  const getButtonClasses = () => {
    if (error) {
      return "p-2 rounded-full transition-colors flex-shrink-0 text-red-500 bg-red-100 dark:bg-red-800 cursor-not-allowed";
    }
    if (loading) {
      return "p-2 rounded-full transition-colors flex-shrink-0 text-gray-400 bg-gray-100 dark:bg-gray-800 cursor-wait";
    }
    if (playing) {
      return "p-2 rounded-full transition-colors flex-shrink-0 text-teal-500 bg-teal-100 dark:bg-teal-800";
    }
    return "p-2 rounded-full transition-colors flex-shrink-0 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700";
  };

  return (
    <button
      onClick={handleClick}
      className={getButtonClasses()}
      aria-label={
        error ? "Audio error" : loading ? "Loading audio" : "Play audio"
      }
      disabled={loading || !!error}
      title={error ? `Error: ${error}` : loading ? "Loading..." : "Play audio"}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : error ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <SpeakerIcon className="w-5 h-5" />
      )}
    </button>
  );
};

export default InlineAudioButton;
