import React from "react";
import { Category, Subcategory, Progress } from "../types";
import { ArrowRightIcon, CheckCircleIcon } from "./icons";

interface SubcategoryListProps {
  category: Category;
  onSubcategorySelect: (subcategory: Subcategory) => void;
  onReviewModeSelect?: (subcategory: Subcategory) => void;
  progress?: Progress;
}

const TOTAL_STAGES_PER_DHIKR = 4; // Should match stages in DhikrScreen

export const SubcategoryList: React.FC<SubcategoryListProps> = ({
  category,
  onSubcategorySelect,
  onReviewModeSelect,
  progress,
}) => {
  const getSubcategoryProgress = (subcategory: Subcategory) => {
    if (!progress || !progress[category.id]) {
      return {
        completed: 0,
        total: subcategory.dhikrIds.length,
        percentage: 0,
        isCompleted: false,
      };
    }

    const categoryProgress = progress[category.id];
    let completed = 0;

    subcategory.dhikrIds.forEach((dhikrId) => {
      if (typeof dhikrId === "number") {
        if (
          (categoryProgress.completedStages?.[dhikrId] || 0) >=
          TOTAL_STAGES_PER_DHIKR
        ) {
          completed++;
        }
      }
    });

    const total = subcategory.dhikrIds.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    const isCompleted = completed === total && total > 0;

    return { completed, total, percentage, isCompleted };
  };

  const handleSubcategoryClick = (
    subcategory: Subcategory,
    isCompleted: boolean
  ) => {
    if (isCompleted && onReviewModeSelect) {
      onReviewModeSelect(subcategory);
    } else {
      onSubcategorySelect(subcategory);
    }
  };

  return (
    <div className="p-4" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          {category.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">{category.subtitle}</p>
      </div>

      <div className="grid gap-4">
        {category.subcategories.map((subcategory) => {
          const { completed, total, percentage, isCompleted } =
            getSubcategoryProgress(subcategory);

          return (
            <div
              key={subcategory.id}
              onClick={() => handleSubcategoryClick(subcategory, isCompleted)}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200 border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {subcategory.title}
                    </h3>
                    {isCompleted && (
                      <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                    {subcategory.subtitle}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                      <span>پیشرفت یادگیری</span>
                      <span>{Math.round(percentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isCompleted
                            ? "bg-green-500"
                            : percentage > 0
                            ? "bg-blue-500"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <span className="ml-2">
                        {completed} از {total} ذکر کامل شده
                      </span>
                    </div>
                    {isCompleted && (
                      <div className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                        آماده برای مرور
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className={`text-2xl ${category.color} mr-4 flex-shrink-0`}
                >
                  {isCompleted ? (
                    <CheckCircleIcon className="w-6 h-6 text-green-500" />
                  ) : (
                    <ArrowRightIcon className="w-6 h-6" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
