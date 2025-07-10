import React from "react";
import { SunIcon, MoonIcon, BookOpenIcon } from "./icons";

interface HeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  totalScore: number;
}

const Header = ({ isDarkMode, toggleDarkMode, totalScore }: HeaderProps) => {
  return (
    <header className="p-4 flex justify-between items-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <BookOpenIcon className="w-7 h-7 text-teal-500" />
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          اذکار من
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/40 px-3 py-1 rounded-xl">
          {totalScore} امتیاز
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
    </header>
  );
};

export default Header;
