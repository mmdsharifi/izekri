import React from "react";
import InlineAudioButton from "./InlineAudioButton";
import { CheckCircleIcon, XCircleIcon } from "../icons";

interface StageTranslateProps {
  arabic: string;
  audioUrl: string;
  options: string[];
  correct: string;
  answerState: { isCorrect: boolean | null; message: string };
  onAnswer: (option: string) => void;
  onTryAgain: () => void;
  onContinue: () => void;
}

const StageTranslate: React.FC<StageTranslateProps> = ({
  arabic,
  audioUrl,
  options,
  correct,
  answerState,
  onAnswer,
  onTryAgain,
  onContinue,
}) => (
  <div>
    <div className="flex items-center justify-center gap-4 mb-8">
      <InlineAudioButton src={audioUrl} />
      <p
        className="font-serif text-2xl md:text-3xl text-center leading-relaxed text-gray-800 dark:text-gray-100 whitespace-pre-line"
        lang="ar"
      >
        {arabic}
      </p>
    </div>
    <h3 className="text-center font-bold text-lg mb-4 text-gray-700 dark:text-gray-200">
      کدام ترجمه صحیح است؟
    </h3>
    <div className="grid grid-cols-1 gap-5 max-w-lg mx-auto">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onAnswer(option)}
          disabled={answerState.isCorrect !== null}
          className={`w-full flex items-center gap-3 py-4 px-6 bg-white dark:bg-gray-900 border-4 border-gray-200 dark:border-gray-700 rounded-xl font-bold text-lg transition-all duration-150 hover:border-teal-400 active:scale-95 whitespace-pre-line ${
            answerState.isCorrect !== null ? "opacity-70" : ""
          }`}
        >
          {option}
        </button>
      ))}
    </div>
    {/* پیام موفقیت و دکمه ادامه */}
    {answerState.isCorrect === true && (
      <div className="mt-6 p-4 rounded-lg flex items-center justify-between bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200">
        <div className="flex items-center gap-2">
          <CheckCircleIcon className="w-6 h-6" />
          <span className="font-bold">{answerState.message}</span>
        </div>
        <button
          onClick={onContinue}
          className="px-6 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600"
        >
          ادامه
        </button>
      </div>
    )}
    {/* پیام خطا و تلاش مجدد */}
    {answerState.isCorrect === false && (
      <div className="mt-6 p-4 rounded-lg text-right bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <XCircleIcon className="w-6 h-6" />
            <span className="font-bold">{answerState.message}</span>
          </div>
          <button
            onClick={onTryAgain}
            className="px-6 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600"
          >
            تلاش مجدد
          </button>
        </div>
        <div className="border-t border-red-200 dark:border-red-700 mt-3 pt-3">
          <p className="font-semibold">پاسخ صحیح:</p>
          <p className="whitespace-pre-line">{correct}</p>
        </div>
      </div>
    )}
  </div>
);

export default StageTranslate;
