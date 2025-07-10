import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import DhikrScreen from "./components/DhikrScreen";
import { CATEGORIES } from "./constants";
import type { Category, Progress } from "./types";

const defaultProgressValue = {
  completedStages: {},
  completedReviews: {},
  score: 0,
};

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  const [progress, setProgress] = useState<Progress>(() => {
    try {
      const savedProgress = localStorage.getItem("dhikrProgress");
      const initialProgress = savedProgress ? JSON.parse(savedProgress) : {};

      // Basic validation to ensure structure is correct
      for (const catId in initialProgress) {
        if (
          typeof initialProgress[catId] !== "object" ||
          initialProgress[catId] === null ||
          Array.isArray(initialProgress[catId])
        ) {
          console.warn(
            `Invalid progress structure for category ${catId}, resetting.`
          );
          delete initialProgress[catId];
        } else if (
          !("completedStages" in initialProgress[catId]) ||
          !("score" in initialProgress[catId])
        ) {
          console.warn(
            `Incomplete progress structure for category ${catId}, resetting.`
          );
          delete initialProgress[catId];
        } else if (!("completedReviews" in initialProgress[catId])) {
          initialProgress[catId].completedReviews = {};
        }
      }

      return initialProgress;
    } catch (error) {
      console.error(
        "Could not load or parse progress from localStorage",
        error
      );
      return {};
    }
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const preferDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const storedTheme = localStorage.getItem("theme");

    if (storedTheme === "dark" || (!storedTheme && preferDark)) {
      setIsDarkMode(true);
    } else {
      setIsDarkMode(false);
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  useEffect(() => {
    try {
      localStorage.setItem("dhikrProgress", JSON.stringify(progress));
    } catch (error) {
      console.error("Could not save progress to localStorage", error);
    }
  }, [progress]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSelectCategory = (categoryId: string) => {
    const category = CATEGORIES.find((c) => c.id === categoryId);
    if (category) {
      setActiveCategory(category);
      setSessionStartTime(Date.now());
    }
  };

  const handleBackToDashboard = () => {
    setActiveCategory(null);
    setSessionStartTime(null);
  };

  const handleUpdateProgress = (
    categoryId: string,
    dhikrId: number,
    stage: number,
    points: number
  ) => {
    setProgress((prev) => {
      const categoryProgress = prev[categoryId] || { ...defaultProgressValue };
      const currentHighestStage =
        categoryProgress.completedStages[dhikrId] || 0;

      // Only update if this is a new, higher stage
      if (stage > currentHighestStage) {
        return {
          ...prev,
          [categoryId]: {
            ...categoryProgress,
            completedStages: {
              ...categoryProgress.completedStages,
              [dhikrId]: stage,
            },
            score: categoryProgress.score + points,
          },
        };
      }
      return prev; // Return previous state if already completed this stage
    });
  };

  const handleCompleteReview = (categoryId: string, reviewId: string) => {
    setProgress((prev) => {
      const categoryProgress = prev[categoryId] || { ...defaultProgressValue };
      if (categoryProgress.completedReviews[reviewId]) return prev; // Already completed

      return {
        ...prev,
        [categoryId]: {
          ...categoryProgress,
          completedReviews: {
            ...categoryProgress.completedReviews,
            [reviewId]: true,
          },
          score: categoryProgress.score + 15, // Points for review
        },
      };
    });
  };

  // Calculate total score across all categories
  const totalScore = Object.values(progress).reduce(
    (sum, cat) => sum + (cat?.score || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <Header
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        totalScore={totalScore}
      />
      {activeCategory ? (
        <DhikrScreen
          category={activeCategory}
          onBack={handleBackToDashboard}
          progressData={
            progress[activeCategory.id] || { ...defaultProgressValue }
          }
          onUpdateProgress={handleUpdateProgress}
          onCompleteReview={handleCompleteReview}
          sessionStartTime={sessionStartTime}
        />
      ) : (
        <Dashboard
          onSelectCategory={handleSelectCategory}
          progress={progress}
        />
      )}
    </div>
  );
}
