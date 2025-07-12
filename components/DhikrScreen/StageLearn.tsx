import React from "react";
import { CheckCircleIcon } from "../icons";
import InlineAudioButton from "./InlineAudioButton";

interface StageLearnProps {
  arabic: string;
  translation: string;
  virtue: string;
  audioUrl: string;
  onContinue: () => void;
}

const StageLearn: React.FC<StageLearnProps> = ({
  arabic,
  translation,
  virtue,
  audioUrl,
  onContinue,
}) => (
  <div className="text-center">
    <div className="flex items-center justify-center gap-4 mb-6">
      <InlineAudioButton src={audioUrl} />
      <p
        className="font-serif text-3xl md:text-4xl leading-[3.5rem] md:leading-[4rem] text-gray-800 dark:text-gray-100 mb-4 whitespace-pre-line"
        lang="ar"
      >
        {arabic}
      </p>
    </div>
    <p className="text-lg text-gray-600 dark:text-gray-300 mt-4 whitespace-pre-line leading-relaxed md:leading-8">
      {translation}
    </p>
    <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg mt-6">
      <h4 className="font-bold text-gray-800 dark:text-white mb-2">
        فضیلت و کاربرد:
      </h4>
      <p className="text-gray-600 dark:text-gray-300">{virtue}</p>
    </div>
    <button
      onClick={onContinue}
      className="mt-8 px-8 py-4 rounded-xl border-4 font-bold text-lg transition bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-teal-400 active:scale-95 text-gray-800 dark:text-gray-100 flex items-center justify-center gap-2"
    >
      <CheckCircleIcon className="w-6 h-6" />
      یاد گرفتم / مرحله بعد
    </button>
  </div>
);

export default StageLearn;
