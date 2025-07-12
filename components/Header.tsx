import React, { useEffect, useRef, useState } from "react";
import { SunIcon, MoonIcon, BookOpenIcon, ArrowRightIcon } from "./icons";
import ProgressBar from "./ProgressBar";

interface HeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  totalScore: number;
  categoryTitle?: string;
  onBack?: () => void;
  // New props for progress
  progressPercent?: number;
  stageIndex?: number;
  totalStages?: number;
}

const ProgressStepper = ({
  current,
  total,
}: {
  current: number;
  total: number;
}) => (
  <div className="flex items-center gap-2 h-2.5">
    {Array.from({ length: total }).map((_, index) => (
      <div
        key={index}
        data-testid="step-dot"
        className={`w-3 h-3 rounded-full transition-all ${
          index < current
            ? "bg-teal-500"
            : index === current
            ? "bg-teal-500 scale-125"
            : "bg-gray-300 dark:bg-gray-600"
        }`}
      />
    ))}
  </div>
);

const Header = ({
  isDarkMode,
  toggleDarkMode,
  totalScore,
  categoryTitle,
  onBack,
  progressPercent,
  stageIndex,
  totalStages,
}: HeaderProps) => {
  const inCategory =
    !!categoryTitle &&
    progressPercent !== undefined &&
    stageIndex !== undefined &&
    totalStages !== undefined;

  // Animation for score bump
  const [scoreBump, setScoreBump] = useState(false);
  const prevScore = useRef(totalScore);
  useEffect(() => {
    if (totalScore > prevScore.current) {
      setScoreBump(true);
      setTimeout(() => setScoreBump(false), 600);
    }
    prevScore.current = totalScore;
  }, [totalScore]);
  return (
    <header className="p-4 flex justify-between items-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between w-full flex-row">
        {/* Right side: Title and back icon */}
        <div className="flex items-center gap-3">
          {categoryTitle ? (
            <>
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400"
                >
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              )}
              <span className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {categoryTitle}
              </span>
            </>
          ) : (
            <>
              <BookOpenIcon className="w-7 h-7 text-teal-500" />
              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                حصن المسلم
              </h1>
            </>
          )}
        </div>
        {/* Left side: Progress bar and dots (if in category) */}
        {inCategory ? (
          <div className="flex flex-col items-end min-w-[140px] w-full max-w-xs">
            <div className="flex flex-row items-center gap-2 w-full">
              {/* حذف درصد پیشرفت */}
              <div className="flex-1 min-w-0 mx-2 flex items-center gap-2">
                <ProgressBar progress={progressPercent || 0} />
                <div className="h-2.5 flex items-center">
                  <ProgressStepper
                    current={stageIndex || 0}
                    total={totalStages || 1}
                  />
                </div>
              </div>
              <span
                className={`text-xs text-teal-600 dark:text-teal-400 font-bold bg-teal-100 dark:bg-teal-900/40 px-2 py-0.5 rounded-xl whitespace-nowrap transition-transform duration-500 ${
                  scoreBump
                    ? "scale-125 ring-2 ring-yellow-400 bg-yellow-100 dark:bg-yellow-900/40"
                    : ""
                }`}
              >
                {totalScore}{" "}
                <span role="img" aria-label="diamond">
                  💎
                </span>
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/40 px-3 py-1 rounded-xl">
              {totalScore}{" "}
              <span role="img" aria-label="diamond">
                💎
              </span>
            </span>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <SunIcon className="w-6 h-6 text-yellow-400" />
              ) : (
                <MoonIcon className="w-6 h-6 text-indigo-500" />
              )}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
