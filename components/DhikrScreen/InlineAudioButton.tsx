import React from "react";
import { useAudio } from "../../hooks/useAudio";
import { SpeakerIcon } from "../icons";

const InlineAudioButton = ({ src }: { src: string }) => {
  const { playing, toggle } = useAudio(src);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggle();
      }}
      className={`p-2 rounded-full transition-colors flex-shrink-0 ${
        playing
          ? "text-teal-500 bg-teal-100 dark:bg-teal-800"
          : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
      }`}
      aria-label="Play audio"
    >
      <SpeakerIcon className="w-5 h-5" />
    </button>
  );
};

export default InlineAudioButton;
