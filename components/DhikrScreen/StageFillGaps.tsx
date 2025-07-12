import React from "react";
import { CheckCircleIcon, XCircleIcon } from "../icons";
import InlineAudioButton from "./InlineAudioButton";

interface StageFillGapsProps {
  sentenceParts: string[]; // بخش‌های جمله، جای خالی با '' مشخص می‌شود
  options: string[];
  filled: (string | null)[]; // انتخاب هر gap
  answerState: { isCorrect: boolean | null; message: string };
  onSelect: (word: string, gapIndex: number) => void;
  onGapClick: (gapIndex: number) => void;
  onTryAgain: () => void;
  onContinue: () => void;
  correct: string;
  disabled?: boolean;
  audioUrl?: string;
}

const StageFillGaps: React.FC<StageFillGapsProps> = ({
  sentenceParts,
  options,
  filled,
  answerState,
  onSelect,
  onGapClick,
  onTryAgain,
  onContinue,
  correct,
  disabled = false,
  audioUrl,
}) => {
  // Compute which options are still available (not already used in filled)
  const availableOptions = options.filter((opt) => {
    const usedCount = filled.filter((f) => f === opt).length;
    const totalCount = options.filter((o) => o === opt).length;
    return usedCount < totalCount;
  });

  // Track which gap is currently active for filling
  const [activeGap, setActiveGap] = React.useState<number | null>(null);

  React.useEffect(() => {
    // Auto-select first empty gap if none active
    if (activeGap === null || filled[activeGap]) {
      const firstEmpty = filled.findIndex((f) => !f);
      setActiveGap(firstEmpty !== -1 ? firstEmpty : null);
    }
  }, [filled, activeGap]);

  return (
    <div className="text-center">
      <div className="flex justify-center mb-4">
        {audioUrl && <InlineAudioButton src={audioUrl} />}
      </div>
      <h3 className="font-bold text-lg mb-4 text-gray-700 dark:text-gray-200">
        کلمه مناسب را برای جای خالی انتخاب کن:
      </h3>
      <div className="text-2xl md:text-3xl font-serif leading-relaxed mb-8 flex flex-wrap justify-center items-center gap-2">
        {sentenceParts.map((part, idx) => {
          if (part === "") {
            // Find the gap index in the filled array (i.e. which gap this is)
            const gapIndices = sentenceParts
              .map((p, i) => (p === "" ? i : null))
              .filter((v) => v !== null);
            const gapIndex = gapIndices.indexOf(idx);
            return (
              <span
                key={idx}
                data-testid={`gap-span-${gapIndex}`}
                className={`inline-block min-w-[64px] border-b-2 border-teal-400 mx-1 px-2 font-bold cursor-pointer transition bg-teal-50 dark:bg-teal-900/30 ${
                  activeGap === gapIndex ? "ring-2 ring-teal-400" : ""
                }`}
                onClick={() => {
                  if (answerState.isCorrect !== null || disabled) return;
                  setActiveGap(gapIndex);
                  if (filled[gapIndex]) onGapClick(gapIndex);
                }}
              >
                {filled[gapIndex] ? filled[gapIndex] : "____"}
              </span>
            );
          } else {
            return <span key={idx}>{part}</span>;
          }
        })}
      </div>
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        {availableOptions.map((word, i) => (
          <button
            key={word + i}
            onClick={() => {
              if (
                activeGap !== null &&
                !filled[activeGap] &&
                answerState.isCorrect === null &&
                !disabled
              ) {
                onSelect(word, activeGap);
              }
            }}
            disabled={
              answerState.isCorrect !== null ||
              disabled ||
              activeGap === null ||
              !!filled[activeGap]
            }
            className={`px-6 py-3 rounded-xl border-4 font-bold text-lg transition-all duration-150 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-teal-400 active:scale-95 ${
              answerState.isCorrect !== null ? "opacity-70" : ""
            }`}
          >
            {word}
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
};

export default StageFillGaps;
