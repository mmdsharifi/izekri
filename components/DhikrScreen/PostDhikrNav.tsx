import React from "react";
import { CheckCircleIcon } from "../icons";

const PostDhikrNav = ({
  onNext,
  onDashboard,
}: {
  onNext: () => void;
  onDashboard: () => void;
}) => (
  <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
    <CheckCircleIcon className="w-24 h-24 text-green-500 mb-6" />
    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
      عالی بود!
    </h2>
    <p className="text-gray-600 dark:text-gray-300 mt-2 mb-8">
      این ذکر را با موفقیت یاد گرفتی. حالا چه کار می‌کنی؟
    </p>
    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
      <button
        onClick={onNext}
        className="w-full px-6 py-4 rounded-xl border-4 font-bold text-lg transition bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-teal-400 active:scale-95 text-gray-800 dark:text-gray-100"
      >
        ذکر بعدی
      </button>
      <button
        onClick={onDashboard}
        className="w-full px-6 py-4 rounded-xl border-4 font-bold text-lg transition bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-teal-400 active:scale-95 text-gray-800 dark:text-gray-100"
      >
        بازگشت به صفحه اصلی
      </button>
    </div>
  </div>
);

export default PostDhikrNav;
