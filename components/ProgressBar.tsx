import React from "react";

interface ProgressBarProps {
  progress: number;
}

const ProgressBar = ({ progress }: ProgressBarProps) => {
  const progressPercentage = Math.max(0, Math.min(100, progress));

  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
      <div
        data-testid="progress-bar-inner"
        className="h-2.5 rounded-full transition-all duration-700 ease-out"
        style={{
          width: `${progressPercentage}%`,
          background:
            "linear-gradient(90deg, #14b8a6 0%, #06b6d4 50%, #38bdf8 100%)",
          boxShadow:
            progressPercentage > 0 ? "0 0 8px 2px #14b8a655" : undefined,
        }}
      ></div>
    </div>
  );
};

export default ProgressBar;
