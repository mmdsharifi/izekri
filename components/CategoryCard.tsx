import React from "react";
import type { Category } from "../types";
import ProgressBar from "./ProgressBar";

interface CategoryCardProps {
  category: Category;
  onSelect: (categoryId: string) => void;
  progress: number;
  score: number;
}

const CategoryCard = ({
  category,
  onSelect,
  progress,
  score,
}: CategoryCardProps) => {
  return (
    <div
      onClick={() => onSelect(category.id)}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition-shadow cursor-pointer p-6 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-700`}>
            <category.icon className={`w-8 h-8 ${category.color}`} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              {category.title}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {category.subtitle}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex justify-between items-center mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">
          <span>پیشرفت</span>
          <span>
            <span className="font-bold text-teal-500">
              {score}{" "}
              <span role="img" aria-label="diamond">
                💎
              </span>
            </span>
          </span>
        </div>
        <ProgressBar progress={progress} />
        <div className="text-right text-xs mt-1.5 text-gray-400 dark:text-gray-500">
          {Math.round(progress)}% کامل شده
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
