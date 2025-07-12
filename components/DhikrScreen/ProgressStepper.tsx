import React from "react";

const ProgressStepper = ({
  current,
  total,
}: {
  current: number;
  total: number;
}) => (
  <div className="flex items-center justify-center gap-2 my-4">
    {Array.from({ length: total }).map((_, index) => (
      <div
        key={index}
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

export default ProgressStepper;
