import React from "react";
import { CheckCircleIcon, ClockIcon, TrophyIcon } from "../icons";

const CategorySummaryView = ({
  score,
  duration,
  onFinish,
}: {
  score: number;
  duration: number;
  onFinish: () => void;
}) => {
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 h-full">
      <TrophyIcon className="w-24 h-24 text-yellow-400" />
      <h2 className="text-3xl font-bold mt-4 text-gray-800 dark:text-white">
        آفرین! دسته کامل شد.
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mt-2">
        شما با موفقیت تمام اذکار این بخش را به پایان رساندید.
      </p>
      <div className="flex flex-col sm:flex-row gap-6 mt-10 bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl">
        <div className="flex items-center gap-3">
          <CheckCircleIcon className="w-10 h-10 text-teal-500" />
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-right">
              <span role="img" aria-label="diamond">
                💎
              </span>
            </p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {score}{" "}
              <span role="img" aria-label="diamond">
                💎
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ClockIcon className="w-10 h-10 text-blue-500" />
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-right">
              زمان سپری شده
            </p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {minutes}
              <span className="text-base">m</span> {seconds}
              <span className="text-base">s</span>
            </p>
          </div>
        </div>
      </div>
      <button
        onClick={onFinish}
        className="mt-12 w-full max-w-xs px-8 py-4 rounded-xl border-4 font-bold text-lg transition bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-teal-400 active:scale-95 text-gray-800 dark:text-gray-100"
      >
        بازگشت به صفحه اصلی
      </button>
    </div>
  );
};

export default CategorySummaryView;
