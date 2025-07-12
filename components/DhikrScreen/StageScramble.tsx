import React from "react";
import { CheckCircleIcon, XCircleIcon } from "../icons";
import InlineAudioButton from "./InlineAudioButton";

interface StageScrambleProps {
  words: string[];
  userSequence: string[];
  answerState: { isCorrect: boolean | null; message: string };
  onWordClick: (word: string) => void;
  onRemoveLast: (word: string, index: number) => void;
  onTryAgain: () => void;
  onContinue: () => void;
  correctSequence: string[];
  scrambleIncorrectWord?: string | null;
  audioUrl?: string;
}

const StageScramble: React.FC<StageScrambleProps> = ({
  words,
  userSequence,
  answerState,
  onWordClick,
  onRemoveLast,
  onTryAgain,
  onContinue,
  correctSequence,
  scrambleIncorrectWord,
  audioUrl,
}) => (
  <div className="text-center">
    <div className="flex justify-center mb-4">
      {audioUrl && <InlineAudioButton src={audioUrl} />}
    </div>
    <h3 className="font-bold text-lg mb-4 text-gray-700 dark:text-gray-200">
      کلمات را به ترتیب صحیح انتخاب کن:
    </h3>
    {/* Selected sequence (Duolingo style) */}
    <div className="flex flex-wrap justify-center gap-2 mb-6 min-h-[48px]">
      {userSequence.map((word, idx) => (
        <button
          key={word + idx}
          onClick={() => onRemoveLast(word, idx)}
          className={`px-4 py-2 rounded-xl font-bold text-lg border transition-all duration-150
            ${
              scrambleIncorrectWord === word
                ? "bg-red-200 dark:bg-red-700 text-red-800 dark:text-red-100 border-red-400 dark:border-red-700"
                : "bg-teal-100 dark:bg-teal-800 text-teal-800 dark:text-teal-100 border-teal-300 dark:border-teal-700"
            }
            hover:bg-red-200 dark:hover:bg-red-700`}
        >
          {word}
        </button>
      ))}
    </div>
    {/* Only show unselected words as options (allow repeated words) */}
    <div className="flex flex-wrap justify-center gap-3 mb-4">
      {words.map((word, idx) => {
        // Count how many times this word appears up to this index in words
        const wordIndex = words
          .slice(0, idx + 1)
          .filter((w) => w === word).length;
        // Count how many times this word appears in userSequence
        const selectedCount = userSequence.filter((w) => w === word).length;
        // Only show if this instance has not been selected yet
        if (selectedCount < wordIndex) {
          return (
            <button
              key={word + idx}
              onClick={() => onWordClick(word)}
              disabled={answerState.isCorrect !== null}
              className={`px-6 py-3 rounded-xl border-4 font-bold text-lg transition-all duration-150 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-teal-400 active:scale-95 ${
                answerState.isCorrect !== null ? "opacity-70" : ""
              } ${
                scrambleIncorrectWord === word
                  ? "border-red-500 text-red-600 bg-red-100 dark:bg-red-900"
                  : ""
              }`}
            >
              {word}
            </button>
          );
        }
        return null;
      })}
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
    {/* پیام خطا و نمایش پاسخ صحیح */}
    {answerState.isCorrect === false && (
      <div className="mt-6 p-4 rounded-lg text-right bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200">
        <div className="flex items-center gap-2 mb-2">
          <XCircleIcon className="w-6 h-6" />
          <span className="font-bold">{answerState.message}</span>
        </div>
        <div className="border-t border-red-200 dark:border-red-700 mt-3 pt-3">
          <p className="font-semibold">ترتیب صحیح:</p>
          <p className="whitespace-pre-line">{correctSequence.join(" ")}</p>
        </div>
        <button
          onClick={onTryAgain}
          className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-all"
        >
          تلاش مجدد
        </button>
      </div>
    )}
  </div>
);

export default StageScramble;
